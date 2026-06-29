import {
  Box,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { useLocation, useNavigate } from 'react-router-dom';

export default function EncuestaEmpleado() {
  const navigate = useNavigate()
  const [dimensiones, setDimensiones] = useState([]);
  const [indice, setIndice] = useState(-1);
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState('');
  const [finalizado, setFinalizado] = useState(false);

  const location = useLocation();
  const access_code = location.state?.code;

  useEffect(() => {
    if (!access_code) {
      navigate('/survey');
    }
  }, [navigate]);
  

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const res = await api.get('api/survey/dimensions/');
        setDimensiones(res.data);
      } catch (err) {
        console.error('Error al cargar las preguntas:', err);
      }
    };

    fetchPreguntas();
  }, []);

  const totalPreguntas = dimensiones.flatMap(d => d.questions).length;

  const preguntasConDim = dimensiones.flatMap(d =>
    d.questions.map(q => ({
      ...q,
      dimension: d.name,
    }))
  );

  const handleRespuesta = (value) => {
    setRespuestas({ ...respuestas, [indice]: value });
  };

  const handleSiguiente = () => {
    if (!respuestas[indice] && indice !== -1) {
      setError('Por favor, selecciona una respuesta antes de continuar.');
      return;
    }

    setError('');
    if (indice < preguntasConDim.length - 1) {
      setIndice(indice + 1);
    } else {
      const payload = {
        access_code,
        answers: preguntasConDim.map((q, i) => ({
          question: q.id,
          value: parseInt(respuestas[i]),
        })),
      };

      api
        .post('api/survey/submit/', payload)
        .then(() => {
          setFinalizado(true);
        })
        .catch(err => {
          console.error('Error al enviar respuestas:', err);
          setError('Ocurrió un error al enviar las respuestas.');
        });
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #5865F2, #9B4DFF)',
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 5 },
          width: '100%',
          maxWidth: 700,
          borderRadius: 4,
          textAlign: 'center',
          backgroundColor: '#fff',
        }}
      >
        {indice === -1 ? (
          <>
            <Typography variant="h4" fontWeight="bold" mb={2}>
              Bienvenido a la encuesta
            </Typography>
            <Typography variant="body1" mb={3}>
              Antes de comenzar, ten en cuenta lo siguiente:
            </Typography>
            <Box textAlign="left" mb={3}>
              <ul>
                <li>La encuesta mide tu percepción sobre el clima laboral.</li>
                <li>Contesta con sinceridad, no hay respuestas correctas o incorrectas.</li>
                <li>Usa una escala de 1 a 5 para cada pregunta:</li>
              </ul>
              <Typography variant="body2" mt={1}>
                1 = Totalmente en desacuerdo, 5 = Totalmente de acuerdo.
              </Typography>
            </Box>
            <Button variant="contained" size="large" fullWidth onClick={() => setIndice(0)}>
              Comenzar Encuesta
            </Button>
          </>
        ) : (
          <Box component={motion.div} key={indice} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="h6" mb={1}>
              Pregunta {indice + 1} de {totalPreguntas}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Dimensión: {preguntasConDim[indice].dimension}
            </Typography>

            <Typography variant="body1" fontWeight="bold" mb={3}>
              {preguntasConDim[indice].text}
            </Typography>

            <RadioGroup
              value={respuestas[indice] || ''}
              onChange={(e) => handleRespuesta(e.target.value)}
            >
              <FormControlLabel value="1" control={<Radio />} label="Totalmente en desacuerdo" />
              <FormControlLabel value="2" control={<Radio />} label="En desacuerdo" />
              <FormControlLabel value="3" control={<Radio />} label="Neutral" />
              <FormControlLabel value="4" control={<Radio />} label="De acuerdo" />
              <FormControlLabel value="5" control={<Radio />} label="Totalmente de acuerdo" />
            </RadioGroup>

            <Typography variant="caption" display="block" mt={1}>
              Selecciona una opción del 1 al 5
            </Typography>

            {error && (
              <Typography color="error" mt={1} mb={2}>
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleSiguiente}
            >
              {indice === preguntasConDim.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Diálogo final de agradecimiento */}
      <Dialog open={finalizado} onClose={() => {}} disableEscapeKeyDown>
        <DialogTitle>¡Gracias por tu participación!</DialogTitle>
        <DialogContent>
          <Typography>
            Hemos registrado tus respuestas correctamente. Agradecemos tu tiempo y honestidad.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => window.location.href = '/synergia/'}>
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
