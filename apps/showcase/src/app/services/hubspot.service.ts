import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HubspotService {
  protected readonly http = inject(HttpClient);
  protected readonly router = inject(Router);

  private apiUrl =
    "https://api.hsforms.com/submissions/v3/integration/submit/144886321/c777ffe9-750b-4063-9b72-f2086dad46fe";

  async DemoRequest(FormValues: {
    fields: { name: string; value: string | null | undefined }[];
    context: { pageUri: string; pageName: string };
  }) {
    try {
      const response = await firstValueFrom(
        this.http.post<{ redirectUri: string }>(this.apiUrl, FormValues),
      );
      if (response.redirectUri) {
        window.location.href = response.redirectUri;
      }
    } catch (e) {
      return console.log(e);
    }
  }
}
