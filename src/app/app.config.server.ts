import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { IMAGE_CONFIG } from '@angular/common';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Prevent Angular's runtime image performance warnings from trying to access `document`
    // during SSR/dev-server rendering.
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true
      }
    }
  ]
};

export const appServerConfig = mergeApplicationConfig(appConfig, serverConfig);
