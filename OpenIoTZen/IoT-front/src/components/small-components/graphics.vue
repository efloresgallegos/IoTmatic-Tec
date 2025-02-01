<template>
  <component
    :is="componenteGrafica"
    :barras_id="barrasId"
    :datos="datos"
    :variables="variables"
    :nombre_color="nombreColor"
    :nombre_barra="nombreBarra"
    :titulo_eje_x="tituloEjeX"
    :titulo_eje_y="tituloEjeY"
    :colores="colores"
  />
</template>

<script>
import { SisdaiBarras, SisdaiDona, SisdaiAreasApiladas, SisdaiCajasBigotes, SisdaiChecks, SisdaiGraficas, SisdaiGraficasGloboInfo } from '@centrogeomx/sisdai-graficas';

export default {
  name: 'DynamicGraphicsComponent',
  components: {
    SisdaiBarras,
    SisdaiDona,
    SisdaiAreasApiladas,
    SisdaiCajasBigotes,
    SisdaiChecks,
    SisdaiGraficas,
    SisdaiGraficasGloboInfo
  },
  props: {
    tipoGrafica: {
      type: String,
      required: true,
      validator: (value) => ['barras', 'dona', 'areasApiladas', 'cajasBigotes'].includes(value)
    },
    barrasId: {
      type: String,
      required: true
    },
    datos: {
      type: Array,
      required: true
    },
    variables: {
      type: Array,
      required: true
    },
    nombreColor: {
      type: String,
      required: true
    },
    nombreBarra: {
      type: String,
      required: true
    },
    tituloEjeX: {
      type: String,
      required: true
    },
    tituloEjeY: {
      type: String,
      required: true
    },
    colores: {
      type: Array,
      required: false,
      default: () => ['#FF5733', '#33C4FF', '#FFB833']
    }
  },
  computed: {
    componenteGrafica() {
      // Retorna el componente correspondiente según el tipo de gráfica
      switch (this.tipoGrafica) {
        case 'barras':
          return 'SisdaiBarras';
        case 'pastel':
          return 'SisdaiDona';
        case 'areasApiladas':
          return 'SisdaiAreasApiladas';
        case 'cajasBigotes':
          return 'SisdaiCajasBigotes';
        default:
          throw new Error(`Tipo de gráfica no soportado: ${this.tipoGrafica}`);
      }
    }
  }
};
</script>

<style scoped>
@import '../../css/small-components/graphics.css';
</style>