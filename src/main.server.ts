import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appServerConfig } from './app/app.config.server';

// IMPORTANT: SSR must pass BootstrapContext, otherwise NG0401 Missing Platform
export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(AppComponent, appServerConfig, context);
}
