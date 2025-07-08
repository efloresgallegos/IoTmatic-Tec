export default {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    accept: 'Aceptar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    save: 'Guardar',
    close: 'Cerrar',
    add: 'Añadir',
    create: 'Crear',
    errorMessage: 'Ha ocurrido un error',
    search: 'Buscar'
  },
  failed: 'Acción fallida',
  success: 'Acción exitosa',
  navBar: {
    home: 'Inicio',
    devices: 'Dispositivos',
    models: 'Modelos',
    modelGenerator: 'Generador de Modelos',
    modelsList: 'Lista de Modelos',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    toggleSidebar: 'Alternar barra lateral',
    logo: 'Logo',
    about: 'Acerca de',
    users: 'Usuarios',
    alerts: 'Alertas'
  },
  accessibilityButton: {
    tools: 'Herramientas de accesibilidad',
    openMenu: 'Abrir menú de accesibilidad',
    fontChange: 'Cambio de fuente',
    underlineLinks: 'Enlaces subrayados',
    textOnly: 'Mostrar solo texto',
    darkView: 'Vista Oscura',
    reset: 'Restablecer',
    language: 'Idioma'
  },
  views: {
    settings: {
      title: 'Configuración del Sistema',
      connectedDevices: 'Dispositivos Conectados',
      refreshDevices: 'Actualizar',
      noDevicesFound: 'No se encontraron dispositivos conectados',
      deviceDetails: 'Detalles del Dispositivo',
      viewDetails: 'Ver detalles',
      reconnect: 'Reconectar',
      disconnect: 'Desconectar',
      reconnecting: 'Reconectando dispositivo...',
      disconnecting: 'Desconectando dispositivo...',
      reconnectSuccess: 'Dispositivo reconectado exitosamente',
      disconnectSuccess: 'Dispositivo desconectado exitosamente',
      columns: {
        id: 'ID',
        name: 'Nombre',
        type: 'Tipo',
        ip: 'Dirección IP',
        lastConnection: 'Última Conexión',
        status: 'Estado',
        actions: 'Acciones'
      },
      status: {
        online: 'En línea',
        offline: 'Desconectado'
      },
      deviceProps: {
        id: 'ID',
        name: 'Nombre',
        type: 'Tipo',
        ip: 'Dirección IP',
        mac: 'Dirección MAC',
        model: 'Modelo',
        firmware: 'Firmware',
        lastConnection: 'Última Conexión',
        status: 'Estado',
        uptime: 'Tiempo Activo',
        protocol: 'Protocolo',
        connectionType: 'Tipo de Conexión'
      },
      errors: {
        fetchFailed: 'Error al obtener los dispositivos conectados',
        reconnectFailed: 'Error al reconectar el dispositivo',
        disconnectFailed: 'Error al desconectar el dispositivo'
      }
    },
    devices: {
      realtime: {
        title: 'Dispositivos conectados en tiempo real',
        toggle: 'Monitoreo en tiempo real',
        activated: 'Monitoreo en tiempo real activado',
        deactivated: 'Monitoreo en tiempo real desactivado',
        connectionError: 'Error de conexión en tiempo real',
        noDevices: 'No hay dispositivos conectados actualmente',
        disabled: 'Activa el monitoreo para ver dispositivos conectados',
        noModel: 'Sin modelo asignado'
      },
      createDevice: {
        title: 'Crear Nuevo Dispositivo',
        namePlaceholder: 'Nombre',
        selectType: 'Seleccionar Tipo',
        descriptionPlaceholder: 'Descripción',
        createButton: 'Crear dispositivo'
      },
      createType: {
        createButton: 'Añadir Tipo',
        title: 'Crear Nuevo Tipo',
        namePlaceholder: 'Nombre'
      },
      filters: {
        searchPlaceholder: 'Buscar dispositivos...',
        filterByType: 'Filtrar por tipo',
        filterByDate: 'Filtrar por fecha',
        allTypes: 'Todos los tipos'
      },
      labels: {
        name: 'Nombre',
        type: 'Tipo',
        description: 'Descripción'
      },
      aria: {
        filterByType: 'Filtrar por tipo',
        filterByDate: 'Filtrar por fecha'
      },
      deviceCard: {
        name: 'Nombre: ',
        type: 'Tipo: ',
        description: 'Descripción: ',
        action: 'Ir al dispositivo'
      }
    },
    home: {
      welcome: '¡Bienvenido a IoT Framework!',
      introduction:
        'El sistema está diseñado para optimizar la gestión y supervisión de dispositivos IoT mediante la integración de tecnologías IoT. Este sistema permite a los usuarios gestionar y analizar datos en tiempo real de varios sensores distribuidos en el invernadero, facilitando la toma de decisiones informadas para mejorar la producción agrícola.',
      features: 'Características Principales',
      featuresList: {
        dataModels: 'Modelos de Datos',
        dataMonitoring: 'Monitoreo de Datos',
        jsonManagement: 'Gestión de JSON',
        dataVisualization: 'Visualización de Datos',
        dataComparison: 'Comparación de Datos'
      },
      featuresDescriptions: {
        dataModels:
          'IoT_Framework permitirá la creación de modelos de datos específicos para cada tipo de sensor, facilitando la comunicación entre los dispositivos IoT y la plataforma.',
        dataMonitoring:
          'Interfaz intuitiva para el monitoreo en tiempo real de los datos recopilados por los sensores.',
        jsonManagement:
          'Flexibilidad para diseñar e importar modelos de datos personalizados a través de archivos JSON, permitiendo una configuración y adaptación fácil del sistema a diferentes necesidades.',
        dataVisualization:
          'Herramientas de visualización para graficar datos a lo largo del tiempo y comparar información de diferentes sensores en fechas específicas.',
        dataComparison:
          'Capacidad para comparar datos de diferentes sensores en distintos momentos para identificar tendencias y patrones.'
      },
      saveJson: 'Guardar JSON'
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
      patternLabel: 'Patrón (regex)',
      patternHint: 'Expresión regular para validar',
      minLengthLabel: 'Longitud mínima',
      minLengthHint: 'Mínimo número de caracteres',
      maxLengthLabel: 'Longitud máxima',
      maxLengthHint: 'Máximo número de caracteres',
      defaultValueLabel: 'Valor predeterminado',
      defaultValueHint: 'Valor por defecto',
      minLabel: 'Valor mínimo',
      minHint: 'Valor mínimo permitido',
      maxLabel: 'Valor máximo',
      maxHint: 'Valor máximo permitido',
      includeTimeLabel: 'Incluir hora',
      dateFormatLabel: 'Formato de fecha',
      minDateLabel: 'Fecha mínima',
      minDateHint: 'Fecha mínima permitida',
      maxDateLabel: 'Fecha máxima',
      maxDateHint: 'Fecha máxima permitida',
      defaultDateLabel: 'Fecha predeterminada',
      defaultDateHint: 'Valor por defecto',
      errorModelNameRequired: 'El nombre del modelo es obligatorio.',
      errorNoFields: 'Debe agregar al menos un campo.',
      errorEmptyFieldName: 'Todos los campos deben tener un nombre.',
      errorDuplicateFieldNames: 'Los nombres de los campos no pueden estar duplicados.',
      fieldDeleted: 'Campo eliminado.',
      subfieldDeleted: 'Subcampo eliminado.',
      confirmDeleteTitle: 'Confirmar eliminación',
      confirmDeleteMessage: '¿Está seguro de que desea eliminar este elemento?',
      jsonEditorError: 'Error en el editor JSON',
      jsonEditorInitError: 'Error al inicializar el editor JSON',
      invalidAiModel: 'El modelo sugerido por la IA no es válido',
      syncError: 'Error al sincronizar el modelo',
      successModelGenerated: 'Modelo generado con éxito.',
      AIInteraction: {
        aiPromptTitle: 'Describe los cambios que deseas realizar',
        aiPromptPlaceholder: 'Describe los cambios que deseas realizar...',
        aiSubmitButton: 'Enviar cambios',
        aiChangesTitle: 'Cambios Generados',
        aiChangesDescription: 'A continuación se muestran los cambios propuestos por la IA.',
        applyChangesButton: 'Aplicar cambios',
        errorPromptRequired: 'Por favor ingresa un prompt.',
        errorProcessingPrompt: 'Hubo un error al procesar el prompt.'
      },
      aiUpdateTitle: 'Actualizar Modelo con IA',
      aiUpdateSuccess: 'Modelo actualizado con éxito.',
      aiUpdateCancelled: 'Actualización del modelo cancelada.',
      currentModel: "Modelo Actual",
      aiSuggestedModel: "Modelo Sugerido por IA",
      dialogWarning: "¿Desea reemplazar su modelo actual con la sugerencia de la IA? Esta acción no se puede deshacer."
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
        delete: 'Eliminar'
      }
    },
    login: {
      welcome: 'Bienvenido a OpenIoTZen',
      username: 'Usuario',
      enterUsername: 'Ingresa tu usuario',
      password: 'Contraseña',
      enterPassword: 'Ingresa tu contraseña',
      login: 'Iniciar sesión',
      success: 'Inicio de sesión exitoso',
      selectLanguage: 'Seleccionar Idioma',
      loginSuccess: 'Inicio de sesión exitoso',
      createDevice: {
        createButton: 'Crear Dispositivo',
        title: 'Añadir un Nuevo Dispositivo',
        namePlaceholder: 'Ingresa el nombre del dispositivo',
        typePlaceholder: 'Ingresa el tipo de dispositivo',
        descriptionPlaceholder: 'Ingresa la descripción del dispositivo'
      }
    },
    alertsAndFilters: {
      title: "Gestión de Alertas y Filtros",
      tabs: {
        alerts: "Alertas",
        filters: "Filtros",
        createFilter: "Crear Filtro"
      },
      alerts: {
        title: "Resumen de Alertas",
        description: "Descripción",
        device: "Dispositivo",
        module: "Módulo",
        status: "Estado",
        resolved: "Resuelto",
        pending: "Pendiente"
      },
      filters: {
        title: "Administrar Filtros",
        device: "Dispositivo",
        module: "Módulo",
        field: "Campo",
        conditions: "Condiciones",
        actions: "Acciones"
      },
      createFilter: {
        title: "Crear Filtro",
        selectDevice: "Seleccionar un dispositivo",
        selectModule: "Seleccionar un módulo",
        selectField: "Seleccionar un campo",
        condition: "Condición",
        threshold: "Umbral",
        addCondition: "Añadir Condición",
        conditionsList: "Condiciones:",
        createFilterButton: "Crear Filtro"
      },
      loading: "Cargando..."
    }
  },
  AIInteraction: {
    tools: "Herramientas de IA",
    openMenu: "Abrir asistente de IA",
    chatTitle: "Asistente de IA",
    templateLabel: "Seleccionar plantilla",
    inputPlaceholder: "Pregúntame algo sobre tu modelo...",
    sendButton: "Enviar mensaje",
    feedbackHelpful: "Esta respuesta fue útil",
    feedbackUnhelpful: "Esta respuesta no fue útil",
    feedbackThanks: "Gracias por tu retroalimentación",
    errorMessage: "Error al procesar la solicitud. Por favor, intenta de nuevo.",
    toggleChat: "Alternar chat IA",
    closeChat: "Cerrar chat",
    templates: {
      modelCreation: "Creación de modelos"
    },
    suggestions: {
      first: "¿Cómo puedo crear un campo de temperatura?",
      second: "¿Qué tipo de datos debo usar para coordenadas GPS?",
      third: "¿Cómo puedo estructurar datos de sensores?",
      createModel: "Crea un modelo para un sensor de temperatura",
      addFields: "Añade campos comunes al modelo",
      optimizeModel: "Optimiza la estructura del modelo",
      validateModel: "Valida la estructura del modelo"
    },
    generalSuggestions: {
      first: "¿Cómo empiezo a crear un modelo?",
      second: "¿Me puedes dar un ejemplo de modelo para IoT?",
      third: "¿Cómo puedo optimizar mi modelo?"
    },
    contextSuggestions: {
      sensor1: "¿Qué sensores son mejores para mi caso?",
      sensor2: "¿Cómo calibrar sensores?",
      temperature1: "¿Qué precisión tiene un sensor de temperatura?",
      temperature2: "¿Cómo manejar datos de temperatura?",
      connection1: "¿Cómo mejorar la conexión de mis dispositivos?",
      connection2: "¿Qué protocolo de conexión es mejor?",
      battery1: "¿Cómo optimizar el consumo de batería?",
      battery2: "¿Qué duración tiene la batería en un sensor?",
      data1: "¿Cómo visualizar estos datos?",
      data2: "¿Cómo analizar estos datos?",
      error1: "¿Cómo resolver este error?",
      error2: "¿Cómo prevenir este problema?"
    }
  },
  enhancedGraphics: {
    loading: 'Cargando datos...',
    noData: 'No hay datos disponibles para mostrar',
    realtimeEnabled: 'Tiempo real activado',
    enableRealtime: 'Activar tiempo real',
    refreshData: 'Actualizar datos',
    downloadPNG: 'Descargar PNG',
    dataUpdated: 'Datos actualizados',
    realtimeActivated: 'Actualizaciones en tiempo real activadas',
    realtimeDeactivated: 'Actualizaciones en tiempo real desactivadas',
    realtimeConnectionError: 'No se pudo conectar al servicio en tiempo real'
  }
}
