import json
from django.core.management.base import BaseCommand
from survey.models import Dimension, Question

QUESTIONS_JSON = [
  {
    "dimension": "Estructura",
    "questions": [
      { "order": 1, "text": "En esta empresa, los trabajos están bien definidos y organizados." },
      { "order": 2, "text": "En esta empresa, está claro quién debe tomar las decisiones." },
      { "order": 3, "text": "La empresa se preocupa por que yo tenga claro su funcionamiento, la autoridad y las responsabilidades de cada uno." },
      { "order": 4, "text": "En esta empresa no es necesario pedir permiso para realizar cada tarea." },
      { "order": 5, "text": "En esta empresa se valoran las ideas nuevas, incluso con la existencia de reglas y trámites administrativos." },
      { "order": 6, "text": "Trabajamos de forma organizada y con planificación." },
      { "order": 7, "text": "En todas las tareas, sé exactamente quién es mi jefe." }
    ]
  },
  {
    "dimension": "Responsabilidad",
    "questions": [
      { "order": 8, "text": "Quienes dirigen esta empresa prefieren reunir a las personas más adecuadas para un trabajo, aunque esto implique cambiar sus puestos habituales." },
      { "order": 9, "text": "En esta empresa se confía en la responsabilidad individual respecto al trabajo." },
      { "order": 10, "text": "Los directivos prefieren que, si uno está haciendo bien su trabajo, siga adelante con confianza en vez de consultarlo todo con ellos." },
      { "order": 11, "text": "En esta empresa los jefes dan indicaciones generales y dejan al personal la responsabilidad del trabajo específico." },
      { "order": 12, "text": "Para que un trabajo quede bien hecho, es necesario actuar con audacia, responsabilidad e iniciativa." },
      { "order": 13, "text": "Cuando enfrentamos problemas en el trabajo, debemos resolverlos por nosotros mismos sin recurrir necesariamente a los jefes." }
    ]
  },
  {
    "dimension": "Recompensa",
    "questions": [
      { "order": 14, "text": "En esta empresa, los errores se abordan con acciones responsables y aprendizaje." },
      { "order": 15, "text": "En esta empresa, las personas asumen sus responsabilidades en el trabajo." },
      { "order": 16, "text": "En esta empresa, quienes se desempeñan mejor pueden llegar a ocupar los mejores puestos." },
      { "order": 17, "text": "Aquí se da mayor importancia al reconocimiento del trabajo bien hecho que al señalamiento de los errores." },
      { "order": 18, "text": "Mientras mejor sea el trabajo que se haga, mejor es el reconocimiento que se recibe." },
      { "order": 19, "text": "Existe una tendencia a enfocarse más en lo positivo que en lo negativo." },
      { "order": 20, "text": "Se recompensa y reconoce el trabajo bien hecho." }
    ]
  },
  {
    "dimension": "Desafío",
    "questions": [
      { "order": 21, "text": "En esta empresa, los errores se consideran una oportunidad para aprender y mejorar." },
      { "order": 22, "text": "Aquí se trabaja con dinamismo, innovación y disposición a asumir retos." },
      { "order": 23, "text": "Esta empresa ha crecido porque ha asumido riesgos cuando ha sido necesario." },
      { "order": 24, "text": "La toma de decisiones se hace de manera estratégica para alcanzar los fines propuestos." },
      { "order": 25, "text": "La dirección de la empresa está dispuesta a correr riesgos con iniciativas prometedoras." },
      { "order": 26, "text": "Para que esta empresa sea superior a otras, a veces es necesario asumir grandes riesgos." }
    ]
  },
  {
    "dimension": "Relaciones",
    "questions": [
      { "order": 27, "text": "Entre el personal predomina un ambiente de amistad." },
      { "order": 28, "text": "Esta empresa se caracteriza por un ambiente cómodo y relajado." },
      { "order": 29, "text": "Aquí es fácil formar amistades." },
      { "order": 30, "text": "La mayoría de las personas muestran interés y cordialidad hacia los demás." },
      { "order": 31, "text": "Existen buenas relaciones humanas entre la administración y el personal." }
    ]
  },
  {
    "dimension": "Cooperación",
    "questions": [
      { "order": 32, "text": "En esta empresa, los jefes son comprensivos cuando se comete un error." },
      { "order": 33, "text": "La administración se esfuerza por conocer las aspiraciones de cada trabajador." },
      { "order": 34, "text": "Existe confianza entre superiores y subordinados." },
      { "order": 35, "text": "La administración muestra interés por las personas, sus problemas e inquietudes." },
      { "order": 36, "text": "Cuando enfrento un trabajo difícil, puedo contar con el apoyo de mi jefe y mis compañeros." }
    ]
  },
  {
    "dimension": "Estándares",
    "questions": [
      { "order": 37, "text": "En esta empresa, se nos exige un alto rendimiento en nuestro trabajo." },
      { "order": 38, "text": "Para la administración, toda tarea puede ser mejorada." },
      { "order": 39, "text": "La administración insiste constantemente en que mejoremos nuestro trabajo individual y en equipo." },
      { "order": 40, "text": "Esta empresa mejorará su rendimiento cuando los trabajadores estén satisfechos." },
      { "order": 41, "text": "Se valoran tanto las características personales del trabajador como su rendimiento laboral." },
      { "order": 42, "text": "Aquí, las personas le dan mucha importancia a hacer bien su trabajo." }
    ]
  },
  {
    "dimension": "Conflicto",
    "questions": [
      { "order": 43, "text": "La mejor manera de causar una buena impresión en esta empresa es participar en discusiones constructivas." },
      { "order": 44, "text": "La dirección cree que las discrepancias entre secciones y empleados pueden ser útiles para la empresa." },
      { "order": 45, "text": "Se nos alienta a expresar nuestras opiniones, incluso si estamos en desacuerdo con nuestros jefes." },
      { "order": 46, "text": "Se toman en cuenta las distintas opiniones para llegar a un acuerdo." }
    ]
  },
  {
    "dimension": "Identidad",
    "questions": [
      { "order": 47, "text": "Las personas están satisfechas de trabajar en esta empresa." },
      { "order": 48, "text": "Siento que pertenezco a un grupo de trabajo que funciona bien." },
      { "order": 49, "text": "Hasta donde yo sé, existe lealtad hacia la empresa." },
      { "order": 50, "text": "La mayoría de las personas aquí están comprometidas con los intereses de la empresa." }
    ]
  }
]



class Command(BaseCommand):
    help = "Carga las preguntas y dimensiones del cuestionario Litwin y Stringer"

    def handle(self, *args, **options):
        for dim_data in QUESTIONS_JSON:
            dim_name = dim_data['dimension']
            dimension, created = Dimension.objects.get_or_create(name=dim_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Creada dimensión: {dim_name}"))

            for question_data in dim_data['questions']:
                question, q_created = Question.objects.get_or_create(
                    dimension=dimension,
                    order=question_data['order'],
                    defaults={'text': question_data['text']}
                )
                if q_created:
                    self.stdout.write(f"  ✓ Pregunta {question.order} creada.")
                else:
                    self.stdout.write(f"  • Pregunta {question.order} ya existía.")
