from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

# Configuración
DATABASE_FILE = 'projects_database.json'

# Estructura base de la base de datos
def initialize_database():
    """Inicializar la base de datos con datos de ejemplo"""
    projects_data = {
        "projects": [
            {
                "id": 1,
                "title": "Sistema de Gestión Empresarial",
                "description": "Este proyecto consiste en el desarrollo de un sistema integral de gestión empresarial que permitirá a las empresas optimizar sus procesos internos, gestionar recursos humanos, controlar inventarios y generar reportes detallados. La aplicación incluirá módulos para contabilidad, ventas, compras y administración general.",
                "image_url": "/imagenes/coding-foto-ejemplo.jpg",
                "logo_url": "/imagenes/logoTomberS.png",
                "stats": {
                    "team_current": 7,
                    "team_max": 23,
                    "duration": "Indefinido",
                    "language": "Español",
                    "type": "Full Stack"
                },
                "technologies": [
                    {"name": "Python", "icon": "Py"},
                    {"name": "HTML5", "icon": "Html"},
                    {"name": "CSS3", "icon": "Css"},
                    {"name": "JavaScript", "icon": "Js"}
                ],
                "objectives": [
                    {"text": "Desarrollar interfaz de usuario intuitiva y responsive", "status": "completed", "icon": "✓"},
                    {"text": "Implementar sistema de autenticación seguro", "status": "completed", "icon": "✓"},
                    {"text": "Crear módulos de gestión empresarial", "status": "in_progress", "icon": "⏳"},
                    {"text": "Integrar sistema de reportes avanzados", "status": "pending", "icon": "📋"}
                ],
                "skills_needed": [
                    "Desarrollo Backend",
                    "Diseño UI/UX", 
                    "Base de Datos",
                    "API REST",
                    "Testing",
                    "DevOps"
                ],
                "progress": 65,
                "status": "active",
                "created_at": "2024-01-15",
                "updated_at": "2024-12-15"
            },
            {
                "id": 2,
                "title": "Aplicación de E-commerce",
                "description": "Desarrollo de una plataforma completa de comercio electrónico con funcionalidades avanzadas de gestión de productos, pagos seguros, y análisis de ventas. Incluye panel administrativo y aplicación móvil.",
                "image_url": "/imagenes/ecommerce-ejemplo.jpg",
                "logo_url": "/imagenes/logoTomberS.png",
                "stats": {
                    "team_current": 5,
                    "team_max": 15,
                    "duration": "6 meses",
                    "language": "Español/Inglés",
                    "type": "Full Stack"
                },
                "technologies": [
                    {"name": "React", "icon": "Rc"},
                    {"name": "Node.js", "icon": "Nd"},
                    {"name": "MongoDB", "icon": "Mg"},
                    {"name": "Express", "icon": "Ex"}
                ],
                "objectives": [
                    {"text": "Crear catálogo de productos dinámico", "status": "completed", "icon": "✓"},
                    {"text": "Implementar carrito de compras", "status": "in_progress", "icon": "⏳"},
                    {"text": "Integrar pasarelas de pago", "status": "pending", "icon": "📋"},
                    {"text": "Desarrollar panel administrativo", "status": "pending", "icon": "📋"}
                ],
                "skills_needed": [
                    "React/Frontend",
                    "Node.js/Backend",
                    "Base de Datos NoSQL",
                    "Pasarelas de Pago",
                    "Diseño UI/UX",
                    "Testing"
                ],
                "progress": 40,
                "status": "active",
                "created_at": "2024-02-01",
                "updated_at": "2024-12-10"
            },
            {
                "id": 3,
                "title": "Sistema de Aprendizaje Online",
                "description": "Plataforma educativa interactiva con cursos, evaluaciones, seguimiento de progreso y gamificación. Incluye herramientas para instructores y estudiantes con videoconferencias integradas.",
                "image_url": "/imagenes/education-ejemplo.jpg",
                "logo_url": "/imagenes/logoTomberS.png",
                "stats": {
                    "team_current": 3,
                    "team_max": 12,
                    "duration": "8 meses",
                    "language": "Español",
                    "type": "Full Stack"
                },
                "technologies": [
                    {"name": "Vue.js", "icon": "Vu"},
                    {"name": "Django", "icon": "Dj"},
                    {"name": "PostgreSQL", "icon": "Pg"},
                    {"name": "WebRTC", "icon": "Wr"}
                ],
                "objectives": [
                    {"text": "Crear sistema de cursos y lecciones", "status": "in_progress", "icon": "⏳"},
                    {"text": "Implementar sistema de evaluaciones", "status": "pending", "icon": "📋"},
                    {"text": "Integrar videoconferencias", "status": "pending", "icon": "📋"},
                    {"text": "Desarrollar gamificación", "status": "pending", "icon": "📋"}
                ],
                "skills_needed": [
                    "Vue.js/Frontend",
                    "Django/Python",
                    "PostgreSQL",
                    "WebRTC/Video",
                    "Gamificación",
                    "Diseño Educativo"
                ],
                "progress": 25,
                "status": "active",
                "created_at": "2024-03-01",
                "updated_at": "2024-12-05"
            }
        ]
    }
    
    with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
        json.dump(projects_data, f, ensure_ascii=False, indent=2)
    
    return projects_data

def load_database():
    """Cargar la base de datos desde el archivo JSON"""
    if not os.path.exists(DATABASE_FILE):
        projects_data ={}
        return projects_data
    
    try:
        with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        projects_data ={}
        return projects_data

def save_database(data):
    """Guardar los datos en el archivo JSON"""
    with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Rutas de la aplicación
@app.route('/')
def index():
    """Página principal que muestra el feed de proyectos"""
    return render_template('feed.html')

@app.route('/bio')
def bio():
    return render_template('Bio.html')

@app.route('/feed')
def feed():
    return render_template('feed.html')


@app.route('/api/projects')
def get_projects():
    """Obtener todos los proyectos"""
    db = load_database()
    return jsonify(db['projects'])

@app.route('/api/projects/<int:project_id>')
def get_project(project_id):
    """Obtener un proyecto específico por ID"""
    db = load_database()
    project = next((p for p in db['projects'] if p['id'] == project_id), None)
    if project:
        return jsonify(project)
    return jsonify({'error': 'Proyecto no encontrado'}), 404

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Crear un nuevo proyecto"""
    db = load_database()
    new_project = request.json
    
    # Generar nuevo ID
    max_id = max([p['id'] for p in db['projects']], default=0)
    new_project['id'] = max_id + 1
    new_project['created_at'] = datetime.now().strftime('%Y-%m-%d')
    new_project['updated_at'] = datetime.now().strftime('%Y-%m-%d')
    
    db['projects'].append(new_project)
    save_database(db)
    
    return jsonify(new_project), 201

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Actualizar un proyecto existente"""
    db = load_database()
    project_index = next((i for i, p in enumerate(db['projects']) if p['id'] == project_id), None)
    
    if project_index is not None:
        updated_data = request.json
        updated_data['id'] = project_id
        updated_data['updated_at'] = datetime.now().strftime('%Y-%m-%d')
        
        db['projects'][project_index].update(updated_data)
        save_database(db)
        
        return jsonify(db['projects'][project_index])
    
    return jsonify({'error': 'Proyecto no encontrado'}), 404

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Eliminar un proyecto"""
    db = load_database()
    project_index = next((i for i, p in enumerate(db['projects']) if p['id'] == project_id), None)
    
    if project_index is not None:
        deleted_project = db['projects'].pop(project_index)
        save_database(db)
        return jsonify({'message': 'Proyecto eliminado', 'project': deleted_project})
    
    return jsonify({'error': 'Proyecto no encontrado'}), 404

@app.route('/api/projects/search')
def search_projects():
    """Buscar proyectos por título, tecnología o habilidad"""
    query = request.args.get('q', '').lower()
    db = load_database()
    
    filtered_projects = []
    for project in db['projects']:
        # Buscar en título
        if query in project['title'].lower():
            filtered_projects.append(project)
            continue
        
        # Buscar en tecnologías
        for tech in project['technologies']:
            if query in tech['name'].lower():
                filtered_projects.append(project)
                break
        else:
            # Buscar en habilidades necesarias
            for skill in project['skills_needed']:
                if query in skill.lower():
                    filtered_projects.append(project)
                    break
    
    return jsonify(filtered_projects)

# Funciones auxiliares para obtener datos específicos
def get_random_project():
    """Obtener un proyecto aleatorio para mostrar en las cartas"""
    import random
    db = load_database()
    return random.choice(db['projects']) if db['projects'] else None

def get_projects_by_status(status):
    """Obtener proyectos por estado"""
    db = load_database()
    return [p for p in db['projects'] if p['status'] == status]

def get_projects_by_technology(tech_name):
    """Obtener proyectos que usan una tecnología específica"""
    db = load_database()
    return [p for p in db['projects'] if any(tech['name'].lower() == tech_name.lower() for tech in p['technologies'])]

if __name__ == '__main__':
    # Inicializar la base de datos si no existe
    if not os.path.exists(DATABASE_FILE):
        initialize_database()
        print(f"Base de datos inicializada en {DATABASE_FILE}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)