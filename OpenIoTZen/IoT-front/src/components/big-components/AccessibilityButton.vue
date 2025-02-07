<template>
    <div 
        class="menu-flotante menu-flotante-derecho menu-accesibilidad" 
        :class="{abierto: estaAbierto}"
    >
        <button
            class="menu-flotante-boton"
            :aria-labelledby="$t('accessibilityButton.tools')"
            aria-controls="menua11y"
            :aria-expanded="estaAbierto"
            @click="estaAbierto = !estaAbierto"
            type="button"
            :aria-label="$t('accessibilityButton.openMenu')"
        >
            <span class="pictograma-accesibilidad" aria-hidden="true" />
        </button>

        <div 
            class="menu-flotante-contenedor" 
            id="menua11y"
            :aria-hidden="!estaAbierto"
        >
            <p id="herramientasaccesibilidad" class="menu-flotante-titulo">
                {{ $t('accessibilityButton.tools') }}
            </p>

            <input id="a11y-tipografia" type="checkbox" v-model="settings.tipografia" @change="alternarTipografiaAccesible"/>
            <label for="a11y-tipografia">
                <span aria-hidden="true" class="pictograma-cambio-tipografia"></span>
                {{ $t('accessibilityButton.fontChange') }}
            </label>

            <input id="a11y-hipervinculos" type="checkbox" v-model="settings.hipervinculos" @change="alternarEnlacesSubrayados"/>
            <label for="a11y-hipervinculos">
                <span aria-hidden="true" class="pictograma-enlace-subrayado"></span>
                {{ $t('accessibilityButton.underlineLinks') }}
            </label>

            <input id="a11y-simplificada" type="checkbox" v-model="settings.simplificada" @change="alternarVistaSimplificada"/>
            <label for="a11y-simplificada">
                <span aria-hidden="true" class="pictograma-vista-simplificada"></span>
                {{ $t('accessibilityButton.textOnly') }}
            </label>

            <input id="a11y-oscura" type="checkbox" v-model="settings.oscura" @change="alternarVistaOscura"/>
            <label for="a11y-oscura">
                <span aria-hidden="true" class="pictograma-contraste"></span>
                {{ $t('accessibilityButton.darkView') }}
            </label>
            
            <button 
                class="boton-secundario boton-chico m-t-2" 
                type="button"
                @click="resetSettings"
            >
                {{ $t('accessibilityButton.reset') }}
            </button>

            <!-- Selector de idioma -->
            <div class="menu-flotante-seccion">
                <label for="idioma-select" class="menu-flotante-label">
                    {{ $t('accessibilityButton.language') }}
                </label>
                <select id="idioma-select" v-model="$i18n.locale" class="menu-flotante-select">
                    <option value="es-MX">Español</option>
                    <option value="en-US">English</option>
                </select>
            </div>
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
@import '../../css/big-components/AccesibilityButton.css';

.menu-flotante-seccion {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.menu-flotante-label {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.menu-flotante-select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: white;
    font-size: 1rem;
}
</style>