import React, { useState, useEffect } from 'react';

const FormulasAdmin = () => {
  const [formulas, setFormulas] = useState([]);
  const [formulaSeleccionada, setFormulaSeleccionada] = useState(null);
  const [precio, setPrecio] = useState('');
  const [accion, setAccion] = useState('aprobar');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarFormulas();
  }, []);

  const cargarFormulas = () => {
    let formulasAdmin = JSON.parse(localStorage.getItem('formulas_admin')) || [];
    const formulasCliente = JSON.parse(localStorage.getItem('formulas_cliente')) || [];
    
    // Combinar y eliminar duplicados por ID
    const todasFormulas = [...formulasAdmin, ...formulasCliente];
    const formulasUnicas = [];
    const idsVistos = new Set();
    
    for (const f of todasFormulas) {
      if (!idsVistos.has(f.id)) {
        idsVistos.add(f.id);
        formulasUnicas.push(f);
      }
    }
    
    localStorage.setItem('formulas_admin', JSON.stringify(formulasUnicas));
    setFormulas(formulasUnicas);
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Fecha no disponible';
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-ES');
    } catch(e) {
      return fechaISO;
    }
  };

  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    const notificacion = document.createElement('div');
    const color = tipo === 'exito' ? '#4CAF50' : '#f44336';
    notificacion.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: fadeInOut 3s ease;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 3000);
  };

  const actualizarFormulaEnStorage = (formulaActualizada) => {
    // Actualizar formulas_admin
    let formulasAdmin = JSON.parse(localStorage.getItem('formulas_admin')) || [];
    const indexAdmin = formulasAdmin.findIndex(f => f.id === formulaActualizada.id);
    if (indexAdmin !== -1) {
      formulasAdmin[indexAdmin] = formulaActualizada;
      localStorage.setItem('formulas_admin', JSON.stringify(formulasAdmin));
    }
    
    // Actualizar formulas_cliente
    let formulasCliente = JSON.parse(localStorage.getItem('formulas_cliente')) || [];
    const indexCliente = formulasCliente.findIndex(f => f.id === formulaActualizada.id);
    if (indexCliente !== -1) {
      formulasCliente[indexCliente] = formulaActualizada;
      localStorage.setItem('formulas_cliente', JSON.stringify(formulasCliente));
    }
    
    // Actualizar estado local
    setFormulas(prev => prev.map(f => f.id === formulaActualizada.id ? formulaActualizada : f));
  };

  const seleccionarFormula = (id) => {
    const formula = formulas.find(f => f.id === id);
    if (formula) {
      setFormulaSeleccionada(formula);
      setPrecio(formula.precio || '');
      setAccion('aprobar');
      setMotivoRechazo('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formulaSeleccionada) {
      mostrarNotificacion('❌ Selecciona una fórmula primero', 'error');
      return;
    }
    
    setLoading(true);
    
    const formulaActualizada = { ...formulaSeleccionada };
    
    if (accion === 'aprobar') {
      if (!precio || precio <= 0) {
        mostrarNotificacion('❌ Ingresa un precio válido', 'error');
        setLoading(false);
        return;
      }
      
      formulaActualizada.estado = 'aprobada';
      formulaActualizada.precio = parseInt(precio);
      formulaActualizada.fechaAprobacion = new Date().toISOString();
      mostrarNotificacion(`✅ Fórmula aprobada por $${parseInt(precio).toLocaleString('es-CO')}`, 'exito');
    } else {
      formulaActualizada.estado = 'rechazada';
      formulaActualizada.motivoRechazo = motivoRechazo || 'No especificado';
      formulaActualizada.fechaRechazo = new Date().toISOString();
      mostrarNotificacion(`❌ Fórmula rechazada`, 'exito');
    }
    
    actualizarFormulaEnStorage(formulaActualizada);
    
    // Limpiar selección
    setFormulaSeleccionada(null);
    setPrecio('');
    setMotivoRechazo('');
    setLoading(false);
  };

  const formulasPendientes = formulas.filter(f => f.estado === 'pendiente');

  return (
    <>
      <main className="admin-main">
        <section className="top-formulas">
          <h1>Gestión de Fórmulas</h1>
        </section>

        <section className="contenedor-formulas">
          {/* LISTA DE FÓRMULAS */}
          <div className="lista-formulas">
            <h2>Fórmulas recibidas</h2>
            <table id="tablaFormulas">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Condición</th>
                  <th>Observación</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody id="tablaBody">
                {formulasPendientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                      <i className="fa-regular fa-check-circle" style={{ fontSize: '48px', color: '#4CAF50' }}></i>
                      <p style={{ marginTop: '10px' }}>No hay fórmulas pendientes</p>
                    </td>
                  </tr>
                ) : (
                  formulasPendientes.map(formula => (
                    <tr 
                      key={formula.id} 
                      onClick={() => seleccionarFormula(formula.id)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <img 
                          src={formula.imagen || '/img/default.jpg'} 
                          width="60" 
                          height="60" 
                          style={{ objectFit: 'cover', borderRadius: '8px' }} 
                          alt="Fórmula"
                          onError={(e) => e.target.src = '/img/default.jpg'}
                        />
                      </td>
                      <td>
                        <strong>{escapeHtml(formula.condicion)}</strong>
                        <br />
                        <small>{formula.cliente?.nombre || 'Cliente'}</small>
                      </td>
                      <td>{escapeHtml(formula.descripcion?.substring(0, 50))}...</td>
                      <td>{formatearFecha(formula.fecha)}</td>
                      <td>
                        <button className="ver" onClick={(e) => {
                          e.stopPropagation();
                          seleccionarFormula(formula.id);
                        }}>
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* DETALLE DE FÓRMULA */}
          <div className="detalle-formula">
            <h2>Detalle de fórmula</h2>
            
            <img 
              id="img-formula" 
              src={formulaSeleccionada?.imagen || '/img/default.jpg'} 
              className="img-grande" 
              alt="Fórmula"
              onError={(e) => e.target.src = '/img/default.jpg'}
            />
            
            <p><strong>Condición:</strong> <span id="condicion">{formulaSeleccionada?.condicion || ''}</span></p>
            <p><strong>Observación:</strong> <span id="observacion">{formulaSeleccionada?.descripcion || ''}</span></p>
            <p><strong>Fecha:</strong> <span id="fecha">{formatearFecha(formulaSeleccionada?.fecha)}</span></p>
            
            <form id="precioForm" onSubmit={handleSubmit}>
              <label>Asignar precio:</label>
              <input 
                type="number" 
                id="precio" 
                placeholder="Ej: 120000" 
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
              
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="accion" 
                    value="aprobar" 
                    checked={accion === 'aprobar'}
                    onChange={() => setAccion('aprobar')}
                  /> 
                  ✅ Aprobar fórmula
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="accion" 
                    value="rechazar" 
                    checked={accion === 'rechazar'}
                    onChange={() => setAccion('rechazar')}
                  /> 
                  ❌ Rechazar fórmula
                </label>
              </div>

              <div id="motivo-rechazo-div" style={{ display: accion === 'rechazar' ? 'block' : 'none' }}>
                <label>Motivo de rechazo:</label>
                <textarea 
                  id="motivo-rechazo" 
                  rows="2" 
                  placeholder="Explica al cliente por qué fue rechazada..."
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                ></textarea>
              </div>

              <div id="cliente-info" style={{ marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
                <strong>👤 Cliente:</strong> {escapeHtml(formulaSeleccionada?.cliente?.nombre || 'No seleccionado')}<br />
                <strong>📧 Email:</strong> {escapeHtml(formulaSeleccionada?.cliente?.email || 'No disponible')}
              </div>

              <button type="submit" className="btn-enviar" disabled={loading}>
                {loading ? 'Procesando...' : 'Enviar precio'}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Estilos CSS */}
      <style jsx>{`
        .admin-main {
          flex: 1;
          padding-bottom: 40px;
          max-width: 1500px;
          margin: auto;
          padding: 40px 20px;
        }
        .top-formulas {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          margin-top: 20px;
          margin-left: 40px;
          font-size: 20px;
        }
        .contenedor-formulas {
          display: flex;
          gap: 25px;
          margin-top: 60px;
        }
        .lista-formulas {
          flex: 1;
          background: var(--color-fondo, #fff);
          padding: 25px;
          border-radius: 12px;
        }
        .lista-formulas h2 {
          margin-bottom: 15px;
        }
        .lista-formulas table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .lista-formulas th,
        .lista-formulas td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .lista-formulas tr:hover {
          background: var(--color-fondo, #fff);
          cursor: pointer;
        }
        .ver {
          background: var(--color-boton, #B90F0F);
          color: var(--color-texto2, #fff);
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .detalle-formula {
          flex: 1;
          background: var(--color-fondo, #fff);
          padding: 20px;
          border-radius: 12px;
        }
        .img-grande {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 10px;
          margin-bottom: 15px;
        }
        .detalle-formula input {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
        .btn-enviar {
          margin-top: 15px;
          width: 100%;
          padding: 12px;
          background: var(--color-boton, #B90F0F);
          color: var(--color-texto2, #fff);
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-enviar:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .radio-group {
          margin: 15px 0;
          display: flex;
          gap: 20px;
        }
        .radio-group label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(100px); }
          15% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(100px); }
        }
        @media (max-width: 768px) {
          .contenedor-formulas {
            flex-direction: column;
          }
          .top-formulas {
            margin-left: 0;
            justify-content: center;
            text-align: center;
          }
          .lista-formulas table {
            font-size: 12px;
          }
          .lista-formulas th,
          .lista-formulas td {
            padding: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default FormulasAdmin;  