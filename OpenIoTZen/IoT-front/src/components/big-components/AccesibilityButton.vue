<template>
    <div 
        class="menu-flotante menu-flotante-derecho menu-accesibilidad" 
        :class="{abierto: estaAbierto}"
    >
        <button
            class="menu-flotante-boton"
            aria-labelledby="herramientasaccesibilidad"
            aria-controls="menua11y"
            :aria-expanded="estaAbierto"
            @click="estaAbierto = !estaAbierto"
            type="button"
            aria-label="Abrir menú de accesibilidad"
        >
            <span class="pictograma-accesibilidad" aria-hidden="true"/>
        </button>

        <div 
            class="menu-flotante-contenedor" 
            id="menua11y"
            :aria-hidden="!estaAbierto"
        >
            <p id="herramientasaccesibilidad" class="menu-flotante-titulo">
                Herramientas de accesibilidad
            </p>

            <input id="a11y-tipografia" type="checkbox" v-model="settings.tipografia" @change="alternarTipografiaAccesible"/>
            <label for="a11y-tipografia">
                <span aria-hidden="true" class="pictograma-cambio-tipografia"></span>
                Cambio de fuente
            </label>

            <input id="a11y-hipervinculos" type="checkbox" v-model="settings.hipervinculos" @change="alternarEnlacesSubrayados"/>
            <label for="a11y-hipervinculos">
                <span aria-hidden="true" class="pictograma-enlace-subrayado"></span>
                Enlaces subrayados
            </label>

            <input id="a11y-simplificada" type="checkbox" v-model="settings.simplificada" @change="alternarVistaSimplificada"/>
            <label for="a11y-simplificada">
                <span aria-hidden="true" class="pictograma-vista-simplificada"></span>
                Mostrar solo texto
            </label>

            <input id="a11y-oscura" type="checkbox" v-model="settings.oscura" @change="alternarVistaOscura"/>
            <label for="a11y-oscura">
                <span aria-hidden="true" class="pictograma-contraste"></span>
                Vista Oscura
            </label>
            
            <button 
                class="boton-secundario boton-chico m-t-2" 
                type="button"
                @click="resetSettings"
            >
                Restablecer
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            estaAbierto: false,
            settings: {
                tipografia: false,
                hipervinculos: false,
                simplificada: false,
                oscura: false
            }
        };
    },
    methods: {
        alternarTipografiaAccesible() {
            document.body.classList.toggle('a11y-tipografia', this.settings.tipografia);
        },
        alternarEnlacesSubrayados() {
            document.body.classList.toggle('a11y-hipervinculos', this.settings.hipervinculos);
        },
        alternarVistaSimplificada() {
            document.body.classList.toggle('a11y-simplificada', this.settings.simplificada);
        },
        alternarVistaOscura() {
            document.body.classList.toggle('a11y-oscura', this.settings.oscura);
        },
        resetSettings() {
            this.settings = {
                tipografia: false,
                hipervinculos: false,
                simplificada: false,
                oscura: false
            };
            this.alternarTipografiaAccesible();
            this.alternarEnlacesSubrayados();
            this.alternarVistaSimplificada();
            this.alternarVistaOscura();
        }
    }
};
</script>

<style>
.a11y-tipografia {
    font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif;
    line-height: 1.5;
    letter-spacing: 0.05em;
    word-spacing: 0.1em;
}

.a11y-oscura {
    background-color: #3f3f3f;
    color: #ffffff;
}

.a11y-oscura input,
.a11y-oscura button {
    background-color: #404040;
    color: #ffffff;
    border: 1px solid #666666;
}

.a11y-oscura input:hover,
.a11y-oscura button:hover {
    background-color: #505050;
    border-color: #777777;
}

.a11y-oscura font {
    color: #a09e9e;
}

</style>