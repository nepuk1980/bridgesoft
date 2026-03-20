import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';
@Component({
  selector: 'app-identityvault-layout',
  imports: [RouterOutlet],
  templateUrl: './identityvault-layout.component.html',
  styleUrl: './identityvault-layout.component.css',
    // ✅ ADDED
  animations: [
  trigger('routeAnimations', [
    transition('* <=> *', [

      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0
        })
      ], { optional: true }),

      group([   // ✅ IMPORTANT FIX

        query(':leave', [
          animate('500ms ease',
            style({
              opacity: 0,
              transform: 'translateX(-200px)'
            })
          )
        ], { optional: true }),

        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateX(200px)'
          }),
          animate('500ms ease',
            style({
              opacity: 1,
              transform: 'translateX(0)'
            })
          )
        ], { optional: true })

      ])

    ])
  ])
]
})
export class IdentityvaultLayoutComponent {
// ✅ ADDED
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  } 
}
