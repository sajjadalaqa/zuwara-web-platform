import "server-only";
import {getZuwaraV2} from "@/lib/api/zuwara/v2";
import {pagination} from "@/lib/api/pagination";
import type {Plan,CarePage} from "@/lib/api/zuwara/care";
export type PublicTherapyPlan=Pick<Plan,"id"|"title"|"description"|"image_url"|"total_sessions"|"sessions_recommended">;
export async function publicTherapyPlans(page:number,locale:string):Promise<CarePage<PublicTherapyPlan>>{
 const selected=Number.isSafeInteger(page)&&page>0?page:1;
 const payload=await getZuwaraV2<PublicTherapyPlan[]>("/public/therapy-plans?"+new URLSearchParams({page:String(selected),per_page:"12"}),locale);
 const meta=pagination(payload);
 for(const plan of payload.data){if(!Number.isSafeInteger(plan.id)||plan.id<1||!plan.title||(!plan.title.en&&!plan.title.ar)||!Number.isSafeInteger(plan.total_sessions)||plan.total_sessions<0)throw Error("Invalid public therapy catalog");}
 return {items:payload.data,page:meta.current_page,perPage:meta.per_page,total:meta.total,hasMore:meta.has_more};
}
