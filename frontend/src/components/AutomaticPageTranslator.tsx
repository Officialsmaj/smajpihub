import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../lib/axiosClient";

type TranslationTarget =
  | { kind: "text"; node: Text; source: string }
  | { kind: "attribute"; element: Element; attribute: string; source: string };

const CACHE_KEY = "smaj_auto_translation_fr_v1";
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label"] as const;
const originalText = new WeakMap<Text, string>();
const appliedText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const appliedAttributes = new WeakMap<Element, Map<string, string>>();

const readCache = () => {
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

const shouldTranslate = (value: string) => {
  const text = value.trim();
  if (text.length < 2 || !/[A-Za-z]/.test(text)) return false;
  if (/^(https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/i.test(text)) return false;
  if (/^(SMAJ(?: PI HUB| Token)?|Pi|EN|FR|LIVE)$/i.test(text)) return false;
  return true;
};

const isExcluded = (element: Element | null) =>
  !element || Boolean(element.closest("script, style, noscript, code, pre, textarea, [contenteditable='true'], [translate='no'], [data-no-auto-translate]"));

const collectTargets = (root: Node): TranslationTarget[] => {
  const targets: TranslationTarget[] = [];
  const visitText = (node: Text) => {
    if (isExcluded(node.parentElement)) return;
    const current = node.nodeValue || "";
    const lastApplied = appliedText.get(node);
    if (!originalText.has(node) || (lastApplied !== undefined && current !== lastApplied)) originalText.set(node, current);
    const source = originalText.get(node) || current;
    if (shouldTranslate(source)) targets.push({ kind: "text", node, source });
  };
  const visitElement = (element: Element) => {
    if (isExcluded(element)) return;
    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      const originals = originalAttributes.get(element) || new Map<string, string>();
      const applied = appliedAttributes.get(element)?.get(attribute);
      if (!originals.has(attribute) || (applied !== undefined && current !== applied)) originals.set(attribute, current);
      originalAttributes.set(element, originals);
      const source = originals.get(attribute) || current;
      if (shouldTranslate(source)) targets.push({ kind: "attribute", element, attribute, source });
    }
  };

  if (root.nodeType === Node.TEXT_NODE) visitText(root as Text);
  if (root.nodeType === Node.ELEMENT_NODE) visitElement(root as Element);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.nodeType === Node.TEXT_NODE) visitText(walker.currentNode as Text);
    else visitElement(walker.currentNode as Element);
  }
  return targets;
};

const restoreEnglish = (root: Node) => {
  const targets = collectTargets(root);
  for (const target of targets) {
    if (target.kind === "text") {
      const original = originalText.get(target.node);
      if (original !== undefined) target.node.nodeValue = original;
      appliedText.delete(target.node);
    } else {
      const original = originalAttributes.get(target.element)?.get(target.attribute);
      if (original !== undefined) target.element.setAttribute(target.attribute, original);
      appliedAttributes.get(target.element)?.delete(target.attribute);
    }
  }
};

const AutomaticPageTranslator = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    let disposed = false;
    let timer = 0;
    let retryTimer = 0;
    let generation = 0;
    const cache = readCache();
    const pendingRoots = new Set<Node>();

    const saveCache = () => {
      try {
        const entries = Object.entries(cache).slice(-1_500);
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
      } catch {
        // Translation remains functional when storage is unavailable.
      }
    };

    const apply = (target: TranslationTarget, translated: string) => {
      if (!translated) return;
      if (target.kind === "text") {
        if (target.node.nodeValue === translated) return;
        target.node.nodeValue = translated;
        appliedText.set(target.node, translated);
      } else {
        if (target.element.getAttribute(target.attribute) === translated) return;
        target.element.setAttribute(target.attribute, translated);
        const values = appliedAttributes.get(target.element) || new Map<string, string>();
        values.set(target.attribute, translated);
        appliedAttributes.set(target.element, values);
      }
    };

    const translate = async (targets: TranslationTarget[], run: number) => {
      const bySource = new Map<string, TranslationTarget[]>();
      targets.forEach((target) => bySource.set(target.source, [...(bySource.get(target.source) || []), target]));
      const missing = [...bySource.keys()].filter((source) => !cache[source]);

      for (let index = 0; index < missing.length && !disposed; index += 40) {
        const texts = missing.slice(index, index + 40);
        try {
          const response = await apiFetch("/translations/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts, target: "fr" }),
          });
          if (!response.ok) continue;
          const data = (await response.json()) as { translations?: string[] };
          texts.forEach((source, offset) => { cache[source] = data.translations?.[offset] || source; });
          saveCache();
        } catch {
          window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(() => schedule(document.body), 5_000);
        }
      }

      if (disposed || run !== generation || i18n.resolvedLanguage !== "fr") return;
      bySource.forEach((items, source) => items.forEach((target) => apply(target, cache[source])));
    };

    const process = () => {
      timer = 0;
      const root = document.body;
      if (!root) return;
      if (i18n.resolvedLanguage !== "fr") {
        restoreEnglish(root);
        pendingRoots.clear();
        return;
      }
      const roots = pendingRoots.size ? [...pendingRoots] : [root];
      pendingRoots.clear();
      const targets = roots.flatMap(collectTargets);
      void translate(targets, generation);
    };

    const schedule = (root: Node = document.body) => {
      if (!root) return;
      pendingRoots.add(root);
      window.clearTimeout(timer);
      window.clearTimeout(retryTimer);
      timer = window.setTimeout(process, 120);
    };

    const observer = new MutationObserver((mutations) => {
      if (i18n.resolvedLanguage !== "fr") return;
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") schedule(mutation.target);
        mutation.addedNodes.forEach((node) => schedule(node));
        if (mutation.type === "attributes") schedule(mutation.target);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...TRANSLATABLE_ATTRIBUTES] });

    const onLanguageChanged = () => {
      generation += 1;
      schedule(document.body);
    };
    i18n.on("languageChanged", onLanguageChanged);
    schedule(document.body);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      observer.disconnect();
      i18n.off("languageChanged", onLanguageChanged);
    };
  }, [i18n]);

  return null;
};

export default AutomaticPageTranslator;
