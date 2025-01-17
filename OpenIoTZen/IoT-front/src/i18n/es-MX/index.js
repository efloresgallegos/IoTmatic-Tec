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
        typePlaceholder: 'Tipo',
        descriptionPlaceholder: 'Descripción',
        createButton: 'Crear',
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
      aiPromptTitle: 'Describe los cambios que deseas realizar',
      aiPromptPlaceholder: 'Describe los cambios que deseas realizar...',
      aiSubmitButton: 'Enviar cambios',
      aiChangesTitle: 'Cambios Generados',
      aiChangesDescription: 'A continuación se muestran los cambios propuestos por la IA.',
      applyChangesButton: 'Aplicar cambios',
      errorPromptRequired: 'Por favor ingresa un prompt.',
      errorProcessingPrompt: 'Hubo un error al procesar el prompt.',
    },
    login: {
      welcome: 'Bienvenido a OpenIoTZen',
      username: 'Usuario',
      enterUsername: 'Ingresa tu usuario',
      password: 'Contraseña',
      enterPassword: 'Ingresa tu contraseña',
      login: 'Iniciar Sesión',
      success: 'Inicio de sesión exitoso'
    }
  },
}
