export const settings = {
  "settings": {
    "fruits": "melon"
  },
  "menu": [
    "General",
    {
      "id": "toggle_setting",
      "name": "Setting Toggle",
      "description": "Toggle Setting Description",
      "type": "toggle",
      "default": true,
    },
    {
      "id": "toggle_setting_2",
      "name": "Setting Toggle 2",
      "description": "Toggle Setting Description",
      "type": "toggle",
      "default": true,
    },
    {
      "id": "toggle_setting_3",
      "name": "Setting Toggle 3",
      "description": "Toggle Setting Description",
      "type": "toggle",
      "default": false,
    },
    "Group 2",
    {
      "id": "toggle_setting_4",
      "name": "Setting Toggle 4",
      "description": "Toggle Setting Description",
      "type": "toggle",
      "default": false,
    },
    "Group 3",
    {
      "id": "toggle_setting_5",
      "name": "Setting Toggle 5",
      "description": "Toggle Setting Description",
      "type": "toggle",
      "default": true,
    },
    {
      "id": "options_setting",
      "name": "Setting Options",
      "description": "Options Setting Description",
      "type": "options",
      "options": [
        {
          "name": "Option 1",
          "value": "option_1"
        },
        {
          "name": "Option 2",
          "value": "option_2"
        },
        {
          "name": "Option 3",
          "value": "option_3"
        }
      ],
      "default": "option_2",
    },
    "Graphics",
    {
      "id": "toggle_graphics",
      "name": "Graphics Toggle",
      "description": "Graphics Setting Description",
      "type": "toggle",
      "default": false,
    },
    {
      "id": "fruits",
      "name": "Favorite fruit",
      "description": "I did not have other ideas",
      "type": "options",
      "options": [
        {
          "name": "Apple",
          "value": "apple"
        },
        {
          "name": "Pear",
          "value": "pear"
        },
        {
          "name": "Melon",
          "value": "melon"
        },
      ],
      "default": "apple",
    }
  ]
}

export interface Settings {
  settings: { [id: string] : boolean | string };
  menu: Array<string | { 
    [id: string]: 
    string | 
    number | 
    boolean | 
    Array<{ 
      [id: string]: 
      string | 
      number | 
      boolean 
    }> 
  }>
}

export class Settings {
  constructor(settings: any) {
    this.settings = {};
    let s: string;
    for (s in settings.settings) {
      this.settings[s] = settings[s]
    }
    this.menu = settings.menu;
  }
}