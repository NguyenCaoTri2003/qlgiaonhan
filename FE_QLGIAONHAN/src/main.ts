// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app.component';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { AuthInterceptor } from './interceptors/auth.interceptor';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideHttpClient(withInterceptorsFromDi()),

//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: AuthInterceptor,
//       multi: true
//     },

//     provideAnimations()
//   ]
// }).catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';   // 👈 thêm dòng này
import { AuthInterceptor } from './interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),   // 👈 QUAN TRỌNG NHẤT

    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    provideAnimations()
  ]
}).catch((err) => console.error(err));