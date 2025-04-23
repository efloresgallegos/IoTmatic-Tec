export default {
  common: {
    loading: 'Loading...',
    error: 'Error',
    accept: 'Accept',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    close: 'Close',
    add: 'Add',
    create: 'Create',
    errorMessage: 'An error has occurred'
  },
  failed: 'Action failed',
  success: 'Action was successful',
  navBar: {
    home: 'Home',
    devices: 'Devices',
    models: 'Models',
    modelGenerator: 'Model Generator',
    modelsList: 'Models List',
    settings: 'Settings',
    logout: 'Logout',
    toggleSidebar: 'Toggle sidebar',
    logo: 'Logo',
    about: 'About',
    users: 'Users',
    alerts: 'Alerts'
  },
  accessibilityButton: {
    tools: 'Accessibility Tools',
    openMenu: 'Open accessibility menu',
    fontChange: 'Font Change',
    underlineLinks: 'Underline Links',
    textOnly: 'Text Only View',
    darkView: 'Dark View',
    reset: 'Reset',
    language: 'Language'
  },
  views: {
    devices: {
      realtime: {
        title: 'Real-time Connected Devices',
        toggle: 'Real-time Monitoring',
        activated: 'Real-time monitoring activated',
        deactivated: 'Real-time monitoring deactivated',
        connectionError: 'Real-time connection error',
        noDevices: 'No devices currently connected',
        disabled: 'Enable monitoring to see connected devices',
        noModel: 'No model assigned'
      },
      createDevice: {
        title: 'Create New Device',
        namePlaceholder: 'Name',
        selectType: 'Select Type',
        descriptionPlaceholder: 'Description',
        createButton: 'Create Device'
      },
      createType: {
        createButton: 'Add Type',
        title: 'Add a New Device Type',
        namePlaceholder: 'Enter type name'
      },
      filters: {
        searchPlaceholder: 'Search devices...',
        filterByType: 'Filter by type',
        filterByDate: 'Filter by date',
        allTypes: 'All types'
      },
      labels: {
        name: 'Name',
        type: 'Type',
        description: 'Description'
      },
      aria: {
        filterByType: 'Filter by type',
        filterByDate: 'Filter by date'
      },
      deviceCard: {
        name: 'Name: ',
        type: 'Type: ',
        description: 'Description: ',
        action: 'Go to device'
      }
    },
    home: {
      welcome: 'Welcome to IoT Framework!',
      introduction:
        'The system is designed to optimize the management and supervision of IoT devices through the integration of IoT technologies. This system allows users to manage and analyze real-time data from various sensors distributed in the greenhouse, facilitating informed decision-making to improve agricultural production.',
      features: 'Main Features',
      featuresList: {
        dataModels: 'Data Models',
        dataMonitoring: 'Data Monitoring',
        jsonManagement: 'JSON Management',
        dataVisualization: 'Data Visualization',
        dataComparison: 'Data Comparison'
      },
      featuresDescriptions: {
        dataModels:
          'IOT_Framework will allow the creation of specific data models for each type of sensor, facilitating communication between IoT devices and the platform.',
        dataMonitoring:
          'Intuitive interface for real-time monitoring of data collected by sensors.',
        jsonManagement:
          'Flexibility to design and import custom data models through JSON files, enabling easy configuration and adaptation of the system to different needs.',
        dataVisualization:
          'Visualization tools to graph data over time and compare information from different sensors on specific dates.',
        dataComparison:
          'Ability to compare data from different sensors at various times to identify trends and patterns.'
      },
      saveJson: 'Save JSON'
    },
    modelCreator: {
      title: 'Model Generator',
      modelNameLabel: 'Model Name',
      modelNamePlaceholder: 'Enter the model name',
      fieldsTitle: 'Fields',
      fieldTitle: 'Field',
      fieldNameLabel: 'Field Name',
      fieldNamePlaceholder: 'Enter the field name',
      fieldTypeLabel: 'Field Type',
      requiredLabel: 'Required',
      subfieldsTitle: 'Subfields',
      subfieldNameLabel: 'Subfield Name',
      subfieldNamePlaceholder: 'Enter the subfield name',
      generateModelButton: 'Generate Model',
      addFieldButton: 'Add Field',
      addSubfieldButton: 'Add Subfield',
      deleteFieldButton: 'Delete Field',
      deleteSubfieldButton: 'Delete Subfield',
      previewTitle: 'Model Preview',
      defaultValueLabel: 'Default Value',
      defaultValueHint: 'Default value',
      includeTimeLabel: 'Include Time',
      dateFormatLabel: 'Date Format',
      defaultDateLabel: 'Default Date',
      defaultDateHint: 'Default value',
      errorModelNameRequired: 'Model name is required.',
      errorNoFields: 'You must add at least one field.',
      errorEmptyFieldName: 'All fields must have a name.',
      errorDuplicateFieldNames: 'Field names cannot be duplicated.',
      fieldDeleted: 'Field deleted.',
      subfieldDeleted: 'Subfield deleted.',
      confirmDeleteTitle: 'Confirm deletion',
      confirmDeleteMessage: 'Are you sure you want to delete this item?',
      jsonEditorError: 'Error in JSON editor',
      jsonEditorInitError: 'Error initializing JSON editor',
      invalidAiModel: 'The AI suggested model is not valid',
      syncError: 'Error synchronizing the model',
      successModelGenerated: 'Model generated successfully.',
      AIInteraction: {
        aiPromptTitle: 'Describe the changes you want to make',
        aiPromptPlaceholder: 'Describe the changes you want to make...',
        aiSubmitButton: 'Submit Changes',
        aiChangesTitle: 'Generated Changes',
        aiChangesDescription: 'Below are the changes proposed by the AI.',
        applyChangesButton: 'Apply Changes',
        errorPromptRequired: 'Please enter a prompt.',
        errorProcessingPrompt: 'There was an error processing the prompt.'
      },
      aiUpdateTitle: 'Update Model with AI',
      aiUpdateSuccess: 'Model updated successfully.',
      aiUpdateCancelled: 'Model update cancelled.',
      currentModel: "Current Model",
      aiSuggestedModel: "AI Suggested Model",
      dialogWarning: "Warning, you are about to generate a new model. This will replace the current model. Are you sure you want to proceed?"
    },
    users: {
      title: 'Add User',
      name: 'Name',
      username: 'Username',
      password: 'Password',
      saveButton: 'Add User',
      existingUsers: 'Existing Users',
      table: {
        name: 'Name',
        username: 'Username',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete'
      }
    },
    login: {
      welcome: 'Welcome to OpenIoTZen',
      username: 'Username',
      enterUsername: 'Enter your username',
      password: 'Password',
      enterPassword: 'Enter your password',
      login: 'Log In',
      success: 'Login successful',
      selectLanguage: 'Select Language',
      loginSuccess: 'Login successful',
      createDevice: {
        createButton: 'Create Device',
        title: 'Add a New Device',
        namePlaceholder: 'Enter device name',
        typePlaceholder: 'Enter device type',
        descriptionPlaceholder: 'Enter device description'
      }
    },
    alertsAndFilters: {
      title: "Alert and Filter Management",
      tabs: {
        alerts: "Alerts",
        filters: "Filters",
        createFilter: "Create Filter"
      },
      alerts: {
        title: "Alerts Overview",
        description: "Description",
        device: "Device",
        module: "Module",
        status: "Status",
        resolved: "Resolved",
        pending: "Pending"
      },
      filters: {
        title: "Manage Filters",
        device: "Device",
        module: "Module",
        field: "Field",
        conditions: "Conditions",
        actions: "Actions"
      },
      createFilter: {
        title: "Create Filter",
        selectDevice: "Select a device",
        selectModule: "Select a module",
        selectField: "Select a field",
        condition: "Condition",
        threshold: "Threshold",
        addCondition: "Add Condition",
        conditionsList: "Conditions:",
        createFilterButton: "Create Filter"
      },
      loading: "Loading..."
    }
  },
  AIInteraction: {
    chatTitle: 'AI Chat',
    toggleChat: 'Toggle AI chat',
    closeChat: 'Close AI chat',
    templateLabel: 'Select a template',
    templates: {
      general: 'General',
      modelCreation: 'Model Creation',
      dataAnalysis: 'Data Analysis',
      deviceConfig: 'Device Configuration',
      troubleshooting: 'Troubleshooting'
    },
    feedbackHelpful: 'This was helpful',
    feedbackUnhelpful: 'This was not helpful',
    feedbackThanks: 'Thanks for your feedback!',
    inputPlaceholder: 'Type a message...',
    sendButton: 'Send message'
  },
  enhancedGraphics: {
    loading: 'Loading data...',
    noData: 'No data available to display',
    realtimeEnabled: 'Real-time enabled',
    enableRealtime: 'Enable real-time',
    refreshData: 'Refresh data',
    downloadPNG: 'Download PNG',
    dataUpdated: 'Data updated',
    realtimeActivated: 'Real-time updates activated',
    realtimeDeactivated: 'Real-time updates deactivated',
    realtimeConnectionError: 'Could not connect to real-time service'
  }
}
