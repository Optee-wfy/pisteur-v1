import { Injectable } from "@angular/core";
import { environment } from "@optee/env";
import trpcClient from "../../trpc-client";

@Injectable()
export class EnumService {
  async showAllUnsyncedEnums() {
    if (environment.slug === "production") {
      alert("This feature is only available in dev or preview environment.");
    } else {
      try {
        const result = await trpcClient.enum.getAllUnsynced.query();
        console.log(result);
        alert(result);
      } catch (err) {
        console.error("[EnumService] Failed to fetch unsynced enums", err);
      }
    }
  }
}
