import type {SmajService} from "@smaj/shared-types";
export type MobileService=SmajService&{atlasIndex:number};
export const services:MobileService[]=[
{slug:"store",name:"SMAJ Store",shortName:"Store",icon:"",atlasIndex:0,status:"live",description:"Shopping · Deals"},
{slug:"stream",name:"SMAJ Stream",shortName:"Stream",icon:"",atlasIndex:12,status:"live",description:"Watch · Videos"},
{slug:"sports",name:"SMAJ Sports",shortName:"Sports",icon:"",atlasIndex:13,status:"in-progress",description:"Play · Scores"},
{slug:"food",name:"SMAJ Food",shortName:"Food",icon:"",atlasIndex:1,status:"in-progress",description:"Eat · Delivery"},
{slug:"jobs",name:"SMAJ Jobs",shortName:"Jobs",icon:"",atlasIndex:2,status:"live",description:"Work · Hire"},
{slug:"education",name:"SMAJ Education",shortName:"Education",icon:"",atlasIndex:3,status:"coming-soon",description:"Learn · Skills"},
{slug:"health",name:"SMAJ Health",shortName:"Health",icon:"",atlasIndex:4,status:"in-progress",description:"Care · Wellness"},
{slug:"transport",name:"SMAJ Transport",shortName:"Transport",icon:"",atlasIndex:5,status:"in-progress",description:"Move · Delivery"},
{slug:"agro",name:"SMAJ Agro",shortName:"Agro",icon:"",atlasIndex:6,status:"in-progress",description:"Grow · Trade"},
{slug:"energy",name:"SMAJ Energy",shortName:"Energy",icon:"",atlasIndex:7,status:"in-progress",description:"Power · Utilities"},
{slug:"charity",name:"SMAJ Charity",shortName:"Charity",icon:"",atlasIndex:8,status:"in-progress",description:"Give · Impact"},
{slug:"housing",name:"SMAJ Housing",shortName:"Housing",icon:"",atlasIndex:9,status:"in-progress",description:"Homes · Rentals"},
{slug:"events",name:"SMAJ Events",shortName:"Events",icon:"",atlasIndex:10,status:"in-progress",description:"Tickets · Fun"},
{slug:"swap",name:"SMAJ Swap",shortName:"Swap",icon:"",atlasIndex:11,status:"in-progress",description:"Swap · Liquidity"},
{slug:"token",name:"SMAJ Token",shortName:"Token",icon:"",atlasIndex:14,status:"coming-soon",description:"Rewards · Utility"}];
