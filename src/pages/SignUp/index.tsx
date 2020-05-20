import React, { useRef, useCallback } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    View,
    ScrollView,
    Keyboard,
    TextInput,
    Alert,
} from 'react-native';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import getValidationErrors from '../../utils/getValidationErros';
import api from '../../services/api';

import Input from '../../components/Input';
import Button from '../../components/Button';
import LogoImg from '../../assets/logo.png';

import { Container, Title, BackToSignIn, BackToSignInText } from './styles'; //eslint-disable-line

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
}

const SignUp: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const navigation = useNavigation();
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const handleSignUp = useCallback(
        async (data: SignUpFormData) => {
            formRef.current?.setErrors({});
            try {
                const schema = Yup.object().shape({
                    name: Yup.string().required('O campo nome é obrigatório.'),
                    email: Yup.string()
                        .required('Email obrigatório.')
                        .email('Digite um email válido'),
                    password: Yup.string().min(6, 'No mínimo 6 digitos'),
                });

                await schema.validate(data, {
                    abortEarly: false,
                });

                await api.post('/users', data);

                Alert.alert(
                    'Cadastro realizado com sucesso',
                    'Vocẽ já pode fazer login no GoBarber.',
                );

                navigation.goBack();
            } catch (error) {
                if (error instanceof Yup.ValidationError) {
                    const errors = getValidationErrors(error);
                    formRef.current?.setErrors(errors);
                    return;
                }

                Alert.alert(
                    'Erro no cadastro',
                    'Ocorreu um erro ao fazer o cadastro, tente novamente.',
                );
            }
        },
        [navigation],
    );

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flex: 1 }}
                >
                    <Container>
                        <Image source={LogoImg} />

                        <View>
                            <Title>Crie sua conta </Title>
                        </View>
                        <Form ref={formRef} onSubmit={handleSignUp}>
                            <Input
                                autoCapitalize="words"
                                name="name"
                                icon="user"
                                placeholder="Nome"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    emailInputRef.current?.focus();
                                }}
                            />

                            <Input
                                ref={emailInputRef}
                                keyboardType="email-address"
                                autoCorrect={false}
                                autoCapitalize="none"
                                name="email"
                                icon="mail"
                                placeholder="E-mail"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    passwordInputRef.current?.focus();
                                }}
                            />

                            <Input
                                ref={passwordInputRef}
                                name="password"
                                secureTextEntry
                                icon="lock"
                                placeholder="Senha"
                                textContentType="newPassword"
                                returnKeyType="send"
                                onSubmitEditing={() => {
                                    formRef.current?.submitForm();
                                }}
                            />

                            <Button
                                onPress={() => {
                                    formRef.current?.submitForm();
                                }}
                            >
                                Entrar
                            </Button>
                        </Form>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>

            <BackToSignIn onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={20} color="#fff" />
                <BackToSignInText>Voltar para logon</BackToSignInText>
            </BackToSignIn>
        </>
    );
};

export default SignUp;
