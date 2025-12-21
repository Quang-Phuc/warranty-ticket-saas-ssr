import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appServerConfig } from './app/app.config.server';

export default () => bootstrapApplication(AppComponent, appServerConfig);
