export const environment = {
  production: true
};

export const api_url = 'http://192.168.0.4/api';
export const signalR_url = 'http://192.168.0.4/chat';
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