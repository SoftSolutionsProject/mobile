import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const QuemSomosScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const socialLinks = [
    { name: 'facebook', url: 'https://facebook.com' },
    { name: 'instagram', url: 'https://instagram.com' },
    { name: 'linkedin', url: 'https://linkedin.com' },
    { name: 'youtube', url: 'https://youtube.com' },
  ];

  return (
    <View style={styles.container}>
      <Header showBackButton title="Sobre Nós" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Sobre a Soft Solutions</Text>
            <Text style={styles.heroSubtitle}>
              Transformando vidas através da educação em tecnologia
            </Text>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nossa Missão</Text>
            <Text style={styles.sectionText}>
              Democratizar o acesso à educação de qualidade em tecnologia, 
              preparando profissionais para os desafios do mercado de trabalho 
              digital e contribuindo para o desenvolvimento tecnológico do país.
            </Text>
          </View>

          {/* Vision Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nossa Visão</Text>
            <Text style={styles.sectionText}>
              Ser a principal referência em educação tecnológica no Brasil, 
              reconhecida pela excelência no ensino e pelo impacto positivo 
              na carreira de nossos alunos.
            </Text>
          </View>

          {/* Values Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nossos Valores</Text>
            <View style={styles.valuesList}>
              <View style={styles.valueItem}>
                <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                <Text style={styles.valueText}>Excelência no ensino</Text>
              </View>
              <View style={styles.valueItem}>
                <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                <Text style={styles.valueText}>Inovação constante</Text>
              </View>
              <View style={styles.valueItem}>
                <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                <Text style={styles.valueText}>Acessibilidade</Text>
              </View>
              <View style={styles.valueItem}>
                <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                <Text style={styles.valueText}>Compromisso com resultados</Text>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Números que nos Orgulham</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>+1000</Text>
                <Text style={styles.statLabel}>Alunos Formados</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50+</Text>
                <Text style={styles.statLabel}>Cursos Disponíveis</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel}>Taxa de Satisfação</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Anos de Experiência</Text>
              </View>
            </View>
          </View>

          {/* Team Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nossa Equipe</Text>
            <Text style={styles.sectionText}>
              Contamos com uma equipe de profissionais altamente qualificados, 
              com vasta experiência no mercado de tecnologia e paixão pelo ensino. 
              Nossos instrutores são especialistas em suas áreas e estão sempre 
              atualizados com as mais recentes tendências tecnológicas.
            </Text>
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Siga-nos nas Redes Sociais</Text>
            <Text style={styles.sectionText}>
              Acompanhe nossas novidades, dicas de tecnologia e depoimentos de alunos.
            </Text>
            <View style={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialButton}
                  onPress={() => openLink(social.url)}
                >
                  <Ionicons name={social.name as any} size={24} color="#125887" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Pronto para começar sua jornada?</Text>
            <Text style={styles.ctaSubtitle}>
              Junte-se a milhares de alunos que já transformaram suas carreiras conosco.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('CursosLista')}
            >
              <Text style={styles.ctaButtonText}>Ver Cursos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  heroSection: {
    backgroundColor: '#4a9eff',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginBottom: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#b0c4de',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  valuesList: {
    marginTop: 10,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 15,
  },
  socialButton: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f8ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaSection: {
    backgroundColor: '#4a9eff',
    padding: 30,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#b0c4de',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuemSomosScreen;
