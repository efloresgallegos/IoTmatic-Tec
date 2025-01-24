<template>

    <draggable>
        <SisdaiBarras
            :barras_id="barrasId"
            :datos="datos"
            :variables="variables"
            :nombre_color="nombreColor"
            :nombre_barra="nombreBarra"
            :titulo_eje_x="tituloEjeX"
            :titulo_eje_y="tituloEjeY"
            :colores="colores"
        />
    </draggable>
</template>

<script>
import { SisdaiBarras } from '@centrogeomx/sisdai-graficas'
import 'sisdai-graficas/dist/sisdai-graficas.css'
import draggable from 'vuedraggable'

export default {
    name: 'DynamicGraphicsComponent',
    components: {
        SisdaiBarras,
        draggable
    },
    props: {
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
    }
}
</script>

<style scoped>
@import '../../css/small-components/graphic.css';
</style>
