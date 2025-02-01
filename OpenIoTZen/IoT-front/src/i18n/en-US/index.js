export default {
  failed: 'Action failed',
  success: 'Action was successful',
  navBar: {
    home: 'Home',
    devices: 'Devices',
    modelGenerator: 'Model Generator',
    settings: 'Settings',
    logout: 'Logout',
    toggleSidebar: 'Toggle sidebar',
    logo: 'Logo',
    about: 'About',
    users: 'Users',
    alerts: 'Alerts',
  },
  accessibilityButton: {
    tools: 'Accessibility Tools',
    openMenu: 'Open accessibility menu',
    fontChange: 'Font Change',
    underlineLinks: 'Underline Links',
    textOnly: 'Text Only View',
    darkView: 'Dark View',
    reset: 'Reset',
  },
  views: {
    home: {
      welcome: 'Welcome to IoT Framework!',
      introduction:
        'The system is designed to optimize the management and supervision of IoT devices through the integration of IoT technologies. This system allows users to manage and analyze real-time data from various sensors distributed in the greenhouse, facilitating informed decision-making to improve agricultural production.',
      features: 'Main Features',
      featuresList: {
        dataModels:
          'Data Models: IOT_Framework will allow the creation of specific data models for each type of sensor, facilitating communication between IoT devices and the platform.',
        dataMonitoring:
          'Data Monitoring: Intuitive interface for real-time monitoring of data collected by sensors.',
        jsonManagement:
          'JSON Management: Flexibility to design and import custom data models through JSON files, enabling easy configuration and adaptation of the system to different needs.',
        dataVisualization:
          'Data Visualization: Visualization tools to graph data over time and compare information from different sensors on specific dates.',
        dataComparison:
          'Data Comparison: Ability to compare data from different sensors at various times to identify trends and patterns.',
      },
      saveJson: 'Save JSON',
    },
    devices: {
      createDevice: {
        title: 'Create New Device',
        namePlaceholder: 'Name',
        selectType: 'Select Type',
        descriptionPlaceholder: 'Description',
        createButton: 'Create Device',
      },
      createType: {
        createButton: 'Add Type',
        title: 'Add a New Device Type',
        namePlaceholder: 'Enter type name',
      },
      filters: {
        searchPlaceholder: 'Search devices...',
        filterByType: 'Filter by type',
        filterByDate: 'Filter by date',
        allTypes: 'All types',
      },
      labels: {
        name: 'Name',
        type: 'Type',
        description: 'Description',
      },
      aria: {
        filterByType: 'Filter by type',
        filterByDate: 'Filter by date',
      },
      deviceCard: {
        name: 'Name: ',
        type: 'Type: ',
        description: 'Description: ',
        action: 'Go to device',
      },
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
      errorModelNameRequired: 'Model name is required.',
      successModelGenerated: 'Model generated successfully.',
      AIInteraction: {
        aiPromptTitle: 'Describe the changes you want to make',
        aiPromptPlaceholder: 'Describe the changes you want to make...',
        aiSubmitButton: 'Submit Changes',
        aiChangesTitle: 'Generated Changes',
        aiChangesDescription: 'Below are the changes proposed by the AI.',
        applyChangesButton: 'Apply Changes',
        errorPromptRequired: 'Please enter a prompt.',
        errorProcessingPrompt: 'There was an error processing the prompt.',
      },
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
        delete: 'Delete',
      },
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
        descriptionPlaceholder: 'Enter device description',
      },
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
    },
  },
}
