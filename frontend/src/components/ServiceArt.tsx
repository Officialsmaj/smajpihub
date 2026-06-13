const ServiceArt = ({ index, className = "" }: { index: number; className?: string }) => { const column = index % 5; const row = Math.floor(index / 5); return <span className={`service-art ${className}`} style={{ backgroundPosition: `${column * 25}% ${row * 50}%` }} aria-hidden="true" />; };
export default ServiceArt;
