from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Importación de modelos del dominio
from core.models.usuario import Usuario
from core.models.cultivo_enfermedad import Cultivo

app = FastAPI(
    title="AgroScanner Backend API",
    description="Servidor central para sincronización de plagas y gestión de usuarios."
)

# ESQUEMAS DE VALIDACIÓN (Pydantic) 
# Estructura estricta y los tipos de datos esperados en los 
# cuerpos (body) de las peticiones HTTP entrantes.

class LoginRequest(BaseModel):
    correo: str
    password: str

class DeteccionSync(BaseModel):
    id_usuario: int
    id_cultivo: int
    id_enfermedad: int
    latitud: float
    longitud: float
    confianza_ia: float
    ruta_foto: str = "" 

# ENDPOINTS (Rutas de la API) 

@app.get("/")
def health_check():
    """Endpoint de validación para monitorear el estado del servidor."""
    return {"status": "ok", "mensaje": "Servidor AgroScanner en ejecución."}

@app.post("/api/login")
def login(request: LoginRequest):
    """
    Autentica a un usuario mediante correo y contraseña.
    Retorna un token de acceso y los metadatos del usuario si es exitoso.
    """
    usuario = Usuario.cargar_por_correo(request.correo)
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    if not usuario.iniciar_sesion(request.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")
        
    return {
        "mensaje": "Autenticación exitosa",
        "token": usuario.obtener_token(),
        "datos_usuario": {
            "id": usuario.id_usuario,
            "nombre": usuario.nombre,
            "rol": usuario.rol
        }
    }

@app.get("/api/catalogos/cultivos")
def listar_cultivos():
    """
    Retorna el catálogo maestro de cultivos registrados en la base de datos central.
    Utilizado para inicializar la base de datos local en los clientes.
    """
    lista_cultivos = Cultivo.obtener_todos()
    # Conversión de objetos Python a diccionarios serializables en JSON
    return {"cultivos": [c.__dict__ for c in lista_cultivos]}

@app.post("/api/sync/detecciones")
def recibir_deteccion(deteccion_json: DeteccionSync):
    """
    Recibe un registro de detección procesado localmente en el cliente
    y lo almacena en la base de datos central.
    """
    
    # Pendiente: Instanciar modelo Deteccion y ejecutar guardar_en_bd_central()
    # nueva_deteccion = Deteccion(...)
    # nueva_deteccion.guardar_en_bd_central()
    
    print(f"[API] Nueva detección sincronizada: {deteccion_json.dict()}")
    return {"estatus": "ok", "mensaje": "Registro procesado e insertado correctamente."}