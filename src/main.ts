import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth.interceptor';
import { provideNgxMask } from 'ngx-mask';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers ?? [],
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideNgxMask()
  ]
}).catch(err => console.error(err));
