export default {
  failed: 'La acción falló',
  success: 'La acción fue exitosa',
  navBar: {
    home: 'Inicio',
    devices: 'Dispositivos',
    modelGenerator: 'Generador de Modelos',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    toggleSidebar: 'Alternar barra lateral',
    logo: 'Logo',
    about: 'Acerca de',
    users: 'Usuarios',
    alerts: 'Alertas',
  },
  accessibilityButton: {
    tools: 'Herramientas de accesibilidad',
    openMenu: 'Abrir menú de accesibilidad',
    fontChange: 'Cambio de fuente',
    underlineLinks: 'Enlaces subrayados',
    textOnly: 'Mostrar solo texto',
    darkView: 'Vista Oscura',
    reset: 'Restablecer',
  },
  views: {
    home: {
      welcome: '¡Bienvenido a IoT Framework!',
      introduction:
        'El sistema está diseñado para optimizar el manejo y la supervisión de dispositivos IoT a través de la integración de tecnologías IoT. Este sistema permitirá a los usuarios gestionar y analizar datos en tiempo real provenientes de diversos sensores distribuidos en el invernadero, facilitando la toma de decisiones informadas para mejorar la producción agrícola.',
      features: 'Características Principales',
      featuresList: {
        dataModels:
          'Modelos de Datos: IOT_Framework permitirá la creación de modelos de datos específicos para cada tipo de sensor, facilitando la comunicación entre los dispositivos IoT y la plataforma.',
        dataMonitoring:
          'Monitoreo de Datos: Interfaz intuitiva para la monitorización en tiempo real de los datos recolectados por los sensores.',
        jsonManagement:
          'Gestión de JSON: Flexibilidad para diseñar e importar modelos de datos personalizados mediante archivos JSON, permitiendo una fácil configuración y adaptación del sistema a diferentes necesidades.',
        dataVisualization:
          'Graficación de Datos: Herramientas de visualización que permitirán graficar los datos a lo largo del tiempo y comparar información de diferentes sensores en fechas específicas.',
        dataComparison:
          'Comparaciones de Datos: Capacidad de comparar datos de diferentes sensores en distintos momentos para identificar tendencias y patrones.',
      },
      saveJson: 'Guardar JSON',
    },
    devices: {
      createDevice: {
        title: 'Crear Nuevo Dispositivo',
        namePlaceholder: 'Nombre',
        selectType: 'Seleccionar Tipo',
        descriptionPlaceholder: 'Descripción',
        createButton: 'Crear dispositivo',
      },
      createType: {
        createButton: 'Añadir Tipo',
        title: 'Crear Nuevo Tipo',
        namePlaceholder: 'Nombre',
      },
      filters: {
        searchPlaceholder: 'Buscar dispositivos...',
        filterByType: 'Filtrar por tipo',
        filterByDate: 'Filtrar por fecha',
        allTypes: 'Todos los tipos',
      },
      labels: {
        name: 'Nombre',
        type: 'Tipo',
        description: 'Descripción',
      },
      aria: {
        filterByType: 'Filtrar por tipo',
        filterByDate: 'Filtrar por fecha',
      },
      deviceCard: {
        name: 'Nombre: ',
        type: 'Tipo: ',
        description: 'Descripción: ',
        action: 'Ir al dispositivo',
      },
    },
    modelCreator: {
      title: 'Generador de Modelos',
      modelNameLabel: 'Nombre del Modelo',
      modelNamePlaceholder: 'Introduce el nombre del modelo',
      fieldsTitle: 'Campos',
      fieldTitle: 'Campo',
      fieldNameLabel: 'Nombre del Campo',
      fieldNamePlaceholder: 'Introduce el nombre del campo',
      fieldTypeLabel: 'Tipo de Campo',
      requiredLabel: 'Requerido',
      subfieldsTitle: 'Subcampos',
      subfieldNameLabel: 'Nombre del Subcampo',
      subfieldNamePlaceholder: 'Introduce el nombre del subcampo',
      generateModelButton: 'Generar Modelo',
      addFieldButton: 'Agregar Campo',
      addSubfieldButton: 'Agregar Subcampo',
      deleteFieldButton: 'Eliminar Campo',
      deleteSubfieldButton: 'Eliminar Subcampo',
      previewTitle: 'Vista Previa del Modelo',
      errorModelNameRequired: 'El nombre del modelo es obligatorio.',
      successModelGenerated: 'Modelo generado con éxito.',
      AIInteraction: {
        aiPromptTitle: 'Describe los cambios que deseas realizar',
        aiPromptPlaceholder: 'Describe los cambios que deseas realizar...',
        aiSubmitButton: 'Enviar cambios',
        aiChangesTitle: 'Cambios Generados',
        aiChangesDescription: 'A continuación se muestran los cambios propuestos por la IA.',
        applyChangesButton: 'Aplicar cambios',
        errorPromptRequired: 'Por favor ingresa un prompt.',
        errorProcessingPrompt: 'Hubo un error al procesar el prompt.',
      },
    },
    users: {
      title: 'Añadir Usuario',
      name: 'Nombre',
      username: 'Nombre de Usuario',
      password: 'Contraseña',
      saveButton: 'Guardar',
      existingUsers: 'Usuarios Existentes',
      table: {
        name: 'Nombre',
        username: 'Usuario',
        actions: 'Acciones',
        edit: 'Editar',
        delete: 'Eliminar',
      },
    },
    login: {
      welcome: 'Bienvenido a OpenIoTZen',
      username: 'Usuario',
      enterUsername: 'Ingresa tu usuario',
      password: 'Contraseña',
      enterPassword: 'Ingresa tu contraseña',
      login: 'Iniciar Sesión',
      success: 'Inicio de sesión exitoso',
      selectLanguage: 'Selecciona un idioma',
      loginSuccess: 'Inicio de sesión exitoso',
    },
    alertsAndFilters: {
      title: "Gestión de Alertas y Filtros",
      tabs: {
        alerts: "Alertas",
        filters: "Filtros",
        createFilter: "Crear Filtro"
      },
      alerts: {
        title: "Visualización de Alertas",
        description: "Descripción",
        device: "Dispositivo",
        module: "Módulo",
        status: "Estado",
        resolved: "Resuelta",
        pending: "Pendiente"
      },
      filters: {
        title: "Gestionar Filtros",
        device: "Dispositivo",
        module: "Módulo",
        field: "Campo",
        conditions: "Condiciones",
        actions: "Acciones"
      },
      createFilter: {
        title: "Crear Filtro",
        selectDevice: "Selecciona un dispositivo",
        selectModule: "Selecciona un módulo",
        selectField: "Selecciona un campo",
        condition: "Condición",
        threshold: "Threshold",
        addCondition: "Agregar Condición",
        conditionsList: "Condiciones:",
        createFilterButton: "Crear Filtro"
      },
      loading: "Cargando..."
    },
  },
}
