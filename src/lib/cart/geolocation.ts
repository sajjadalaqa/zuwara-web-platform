export type VisitLocation={lat:number;long:number;accuracy:number|null};
export class VisitLocationError extends Error{constructor(public code:"denied"|"timeout"|"unavailable"|"insecure"){super(code);}}
export async function locateVisit(geo:Pick<Geolocation,"getCurrentPosition">|undefined,secure=true):Promise<VisitLocation>{
 if(!secure)throw new VisitLocationError("insecure");
 if(!geo)throw new VisitLocationError("unavailable");
 const request=(highAccuracy:boolean)=>new Promise<VisitLocation>((resolve,reject)=>{
  geo.getCurrentPosition(position=>{const {latitude:lat,longitude:long,accuracy}=position.coords;if(!Number.isFinite(lat)||!Number.isFinite(long)||Math.abs(lat)>90||Math.abs(long)>180){reject(new VisitLocationError("unavailable"));return;}resolve({lat,long,accuracy:Number.isFinite(accuracy)?accuracy:null});},error=>reject(new VisitLocationError(error.code===1?"denied":error.code===3?"timeout":"unavailable")),{enableHighAccuracy:highAccuracy,timeout:10000,maximumAge:highAccuracy?0:60000});
 });
 try{return await request(true);}catch(error){if(error instanceof VisitLocationError&&error.code==="denied")throw error;return request(false);}
}
