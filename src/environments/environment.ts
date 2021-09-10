// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false
};

export const api_url = 'http://localhost:56841/api';
export const signalR_url = 'http://localhost:56841/chat';
export const logger_max_retries = 3;
export const google_api_key = 'test';

export const form_options = [
  {
    group: [
      { icon: 'sort', text: 'Short Answer' },
      { icon: 'subject', text: 'Paragraph' }
    ]
  },
  {
    group: [
      { icon: 'radio_button_checked', text: 'Multiple choice'},
      { icon: 'check_box', text: 'Checkboxes'},
      { icon: 'arrow_drop_down_circle', text: 'Dropdown'}
    ]
  },
  {
    group: [
      { icon: 'backup', text: 'File upload' }
    ]
  },
  {
    group: [
      { icon: 'settings_ethernet', text: 'Linear scale'},
      { icon: 'grid_on', text: 'Multiple choice grid'},
      { icon: 'apps', text: 'Checkbox grid'}
    ]
  },
  {
    group: [
      { icon: 'event', text: 'Date'},
      { icon: 'query_builder', text: 'Time'}
    ]
  },
  {
    group: [
      { icon: 'travel_explore', text: 'Location' }
    ]
  }
];

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
