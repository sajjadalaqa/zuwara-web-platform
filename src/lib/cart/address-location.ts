export type AddressLocationState="coordinates-present"|"coordinates-missing"|"coordinates-invalid"|"coordinates-not-returned";
export function addressLocationState(row:{lat?:unknown;long?:unknown;latitude?:unknown;longitude?:unknown}):AddressLocationState{
 if(!["lat","long","latitude","longitude"].some(key=>Object.prototype.hasOwnProperty.call(row,key)))return "coordinates-not-returned";
 const lat=row.latitude??row.lat,long=row.longitude??row.long;
 if(lat===undefined||lat===null||long===undefined||long===null||String(lat).trim()===""||String(long).trim()==="")return "coordinates-missing";
 const numeric=(value:unknown)=>typeof value==="number"||(typeof value==="string"&&/^-?\d+(?:\.\d+)?$/.test(value));
 return numeric(lat)&&numeric(long)&&Number.isFinite(Number(lat))&&Number.isFinite(Number(long))&&Math.abs(Number(lat))<=90&&Math.abs(Number(long))<=180?"coordinates-present":"coordinates-invalid";
}
