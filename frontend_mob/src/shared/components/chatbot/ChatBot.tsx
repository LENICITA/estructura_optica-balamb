// src/shared/components/chatbot/ChatBot.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatBotController } from '../../../core/controllers/ChatBotController';
import { ChatBotButton } from '../../../core/services/ChatBotService';
import { COLORS } from '../../constants/colors';

interface Mensaje {
  id: string;
  texto: string;
  tipo: 'usuario' | 'bot';
}

export const ChatBot = () => {

  const chatBotController = useRef(new ChatBotController()).current;

  const [abierto, setAbierto] = useState(false);

  const [mensaje, setMensaje] = useState('');

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 'inicio',
      texto:
        '¡Hola! Soy OptiBot 👋\n¿En qué puedo ayudarte?',
      tipo: 'bot',
    },
  ]);

  const [botones, setBotones] = useState<ChatBotButton[]>([]);

  const [enviando, setEnviando] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollRef =
    useRef<ScrollView>(null);

  const inputRef = useRef<TextInput>(null);

  // CARGAR BOTONES

  useEffect(() => {
    cargarBotones();
  }, []);

useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener(
    'keyboardDidShow',
    () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  );

  const keyboardDidHideListener = Keyboard.addListener(
    'keyboardDidHide',
    () => {
      setKeyboardVisible(false);
    }
  );

  return () => {
    keyboardDidShowListener.remove();
    keyboardDidHideListener.remove();
  };
}, []);

  const cargarBotones = async () => {
    try {
      const data = await chatBotController.obtenerBotones();

      setBotones(data);
    } catch (error) {
      console.error('Error cargando botones:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

  }, [mensajes]);

  // AGREGAR MENSAJE

  const agregarMensaje = (
    texto: string,
    tipo: 'usuario' | 'bot'
  ) => {
    setMensajes((prev) => [
      ...prev,
      {
        id:
          Date.now().toString() +
          Math.random().toString(),
        texto,
        tipo,
      },
    ]);
  };

  // ENVIAR

  const enviarMensaje = async (
    textoPersonalizado?: string
  ) => {
    const texto = (
      textoPersonalizado ?? mensaje
    ).trim();

    if (!texto) {
      return;
    }

    if (enviando) {
      return;
    }

    // Mostrar mensaje usuario
    agregarMensaje(
      texto,
      'usuario'
    );

    setMensaje('');
    inputRef.current?.blur();

    try {

      setEnviando(true);

      const response =
        await chatBotController.enviarMensaje(texto);

      if (response.success) {

        agregarMensaje(
          response.respuesta || '',
          'bot'
        );

      } else {

        agregarMensaje(
          'Lo siento, ocurrió un problema. Intenta nuevamente.',
          'bot'
        );

      }

    } catch (error) {

      console.error(
        'Error enviando mensaje:',
        error
      );

      agregarMensaje(
        'No pude conectarme con OptiBot. Intenta nuevamente.',
        'bot'
      );

    } finally {

      setEnviando(false);

    }

  };

  const seleccionarBoton = (
    boton: ChatBotButton
  ) => {

    enviarMensaje(boton.value);

  };

    if (!abierto) {
      return (
        <TouchableOpacity
          style={[
            styles.floatingButton,
            keyboardVisible && styles.floatingButtonWithKeyboard,
          ]}
          onPress={() => setAbierto(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubbles" size={27} color={COLORS.white} />
        </TouchableOpacity>
      );
    }

    return (
      <Modal
        visible={abierto}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setAbierto(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAbierto(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                style={styles.modalContent}
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
              >
                <View style={styles.chatContainer}>
                  {/* HEADER */}
                  <View style={styles.chatHeader}>
                    <View style={styles.headerLeft}>
                      <View style={styles.botIcon}>
                        <Ionicons name="chatbubbles" size={19} color={COLORS.primary} />
                      </View>
                      <View>
                        <Text style={styles.headerTitle}>OptiBot</Text>
                        <Text style={styles.headerStatus}>Asistente virtual</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setAbierto(false)} style={styles.closeButton}>
                      <Ionicons name="close" size={23} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>

                  {/* MENSAJES */}
                  <ScrollView
                    ref={scrollRef}
                    style={styles.messages}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {mensajes.map((item) => (
                      <View
                        key={item.id}
                        style={[
                          styles.messageRow,
                          item.tipo === 'usuario' ? styles.userRow : styles.botRow,
                        ]}
                      >
                        <View
                          style={[
                            styles.messageBubble,
                            item.tipo === 'usuario' ? styles.userBubble : styles.botBubble,
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageText,
                              item.tipo === 'usuario' ? styles.userText : styles.botText,
                            ]}
                          >
                            {item.texto}
                          </Text>
                        </View>
                      </View>
                    ))}
                    {enviando && (
                      <View style={styles.botRow}>
                        <View style={styles.typingBubble}>
                          <ActivityIndicator size="small" color={COLORS.primary} />
                          <Text style={styles.typingText}>OptiBot está escribiendo...</Text>
                        </View>
                      </View>
                    )}
                  </ScrollView>

                  {/* BOTONES RÁPIDOS */}
                  {botones.length > 0 && (
                    <View style={styles.quickSection}>
                      <Text style={styles.quickTitle}>Preguntas rápidas</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.quickButtons}
                      >
                        {botones.map((boton) => (
                          <TouchableOpacity
                            key={boton.id}
                            style={styles.quickButton}
                            onPress={() => seleccionarBoton(boton)}
                            disabled={enviando}
                          >
                            <Text style={styles.quickButtonText}>{boton.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* INPUT */}
                  <View style={styles.inputSection}>
                    <TextInput
                      ref={inputRef}
                      style={styles.input}
                      placeholder="Escribe un mensaje..."
                      placeholderTextColor="#999"
                      value={mensaje}
                      onChangeText={setMensaje}
                      multiline
                      maxLength={300}
                      editable={!enviando}
                      returnKeyType="send"
                      onSubmitEditing={() => enviarMensaje()}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        (!mensaje.trim() || enviando) && styles.sendButtonDisabled,
                      ]}
                      onPress={() => enviarMensaje()}
                      disabled={!mensaje.trim() || enviando}
                    >
                      <Ionicons name="send" size={19} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      right: 18,
      bottom: 150,
      width: 55,
      height: 55,
      borderRadius: 28,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      zIndex: 999,
    },

    floatingButtonWithKeyboard: {
      bottom: 10,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
      paddingBottom: 40,
    },

    modalContent: {
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        marginBottom: 60,
    },

    chatContainer: {
        height: 380,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 15,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },

    chatHeader: {
      height: 58,
      backgroundColor: COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    botIcon: {
      width: 35,
      height: 35,
      borderRadius: 18,
      backgroundColor: COLORS.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    headerTitle: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '700',
    },

    headerStatus: {
      color: '#FFECEC',
      fontSize: 11,
      marginTop: 1,
    },

    closeButton: {
      padding: 5,
    },

    messages: {
      flex: 1,
      backgroundColor: '#FAFAFA',
    },

    messagesContent: {
      padding: 12,
      paddingBottom: 8,
    },

    messageRow: {
      width: '100%',
      marginBottom: 8,
    },

    botRow: {
      alignItems: 'flex-start',
    },

    userRow: {
      alignItems: 'flex-end',
    },

    messageBubble: {
      maxWidth: '82%',
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 14,
    },

    botBubble: {
      backgroundColor: '#F0F1F3',
      borderBottomLeftRadius: 4,
    },

    userBubble: {
      backgroundColor: COLORS.primary,
      borderBottomRightRadius: 4,
    },

    messageText: {
      fontSize: 13,
      lineHeight: 18,
    },

    botText: {
      color: COLORS.text,
    },

    userText: {
      color: COLORS.white,
    },

    typingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0F1F3',
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 14,
    },

    typingText: {
      fontSize: 11,
      color: COLORS.gray,
      marginLeft: 7,
    },

    quickSection: {
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
      paddingTop: 7,
      paddingBottom: 7,
    },

    quickTitle: {
      fontSize: 10,
      color: COLORS.gray,
      marginLeft: 12,
      marginBottom: 5,
    },

    quickButtons: {
      paddingHorizontal: 10,
      gap: 6,
    },

    quickButton: {
      paddingHorizontal: 11,
      paddingVertical: 6,
      backgroundColor: '#F1F1F3',
      borderRadius: 14,
    },

    quickButtonText: {
      fontSize: 11,
      color: COLORS.text,
      fontWeight: '500',
    },

    inputSection: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 9,
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
      backgroundColor: COLORS.white,
    },

    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 70,
      backgroundColor: '#F7F7F8',
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 11,
      paddingHorizontal: 11,
      paddingVertical: 8,
      fontSize: 13,
      color: COLORS.text,
      marginRight: 7,
    },

    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 11,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    sendButtonDisabled: {
      opacity: 0.45,
    },
  });