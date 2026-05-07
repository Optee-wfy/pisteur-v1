import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import type { BlogPostCardProps } from "../post-card/post-card.component";
import { BlogPostCardComponent } from "../post-card/post-card.component";

@Component({
  selector: "op-blog-post-list",
  host: {
    class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
  },
  template: `
    @for (post of posts(); track post.slug) {
      <op-blog-post-card
        class="cursor-pointer"
        (click)="postClick.emit(post.slug)"
        [post]="post"
      />
    } @empty {
      <oui-message>Aucun article trouvé</oui-message>
    }
  `,
  imports: [RouterModule, BlogPostCardComponent, MessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostListComponent {
  postClick = output<string>();

  posts = input.required<BlogPostCardProps[]>();
}
