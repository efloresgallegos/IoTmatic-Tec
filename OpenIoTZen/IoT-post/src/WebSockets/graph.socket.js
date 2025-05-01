// Este archivo mantiene la estructura pero elimina la funcionalidad de WebSocket para gráficos
// Se mantiene para compatibilidad con las referencias existentes
// En futuras actualizaciones se debería eliminar completamente

/**
 * Stub de función para mantener compatibilidad con el resto del código
 * @deprecated Esta funcionalidad ha sido eliminada en favor de la visualización basada en fechas
 */
const emitGraphDataUpdate = async (data) => {
  console.log('emitGraphDataUpdate: Esta funcionalidad ha sido eliminada');
};

/**
 * Stub de función para mantener compatibilidad con el resto del código
 * @deprecated Esta funcionalidad ha sido eliminada en favor de la visualización basada en fechas
 */
const subscribeToGraphUpdates = (socket, data) => {
  console.log('subscribeToGraphUpdates: Esta funcionalidad ha sido eliminada');
  
  // Informar al cliente que esta funcionalidad ha sido desactivada
  socket.send(JSON.stringify({
    event: 'graph_subscription_confirmed',
    data: {
      status: 'error',
      message: 'La funcionalidad de gráficos por WebSockets ha sido desactivada. Por favor, use la visualización basada en fechas.'
    }
  }));
};

export {
  emitGraphDataUpdate,
  subscribeToGraphUpdates
};