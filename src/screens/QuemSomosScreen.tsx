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
import { CourseCache } from '../services/CourseCache';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const QuemSomosScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const socialLinks = [
    { name: 'instagram', url: 'https://www.instagram.com/softsolutionsproject/' },
    { name: 'youtube', url: 'https://www.youtube.com/@SoftSolutionsFatec' },
    { name: 'linkedin', url: 'https://www.linkedin.com/in/soft-solutions/' },
    { name: 'facebook', url: 'https://www.facebook.com/softsolutions' },
  ];

  return (
    <View style={styles.container}>
      <Header showBackButton title="Sobre Nós" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Nossa História</Text>
            <Text style={styles.heroSubtitle}>
              A SoftSolutions nasceu há mais de uma década, quando um grupo de amigos apaixonados
              por computação decidiu criar soluções inovadoras para os desafios do mercado,
              começando como uma empresa de consultoria em design e programação. Junte-se a
              milhares de alunos que já transformaram suas carreiras conosco.
            </Text>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Missão</Text>
            <Text style={styles.sectionText}>
              Ajudar os alunos com o desenvolvimento, implementação, manutenções e atualizações de
              softwares, fornecendo uma experiência agradável, facilitada e acessível.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visão</Text>
            <Text style={styles.sectionText}>
              Fazer com que os alunos tenham facilidade em desenvolver seus próprios sistemas para
              fazer a diferença no mercado de trabalho.
            </Text>
          </View>

          {/* Values Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valores</Text>
            <Text style={styles.sectionText}>
              Inovação, organização, simplicidade, sustentabilidade, acessibilidade, qualidade,
              foco no usuário, ética, transparência, responsabilidade, com intenção de deixar uma
              boa e duradoura impressão em nossos clientes.
            </Text>
          </View>

          {/* Stats Section */}
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
                  <Ionicons name={`logo-${social.name}` as any} size={24} color="#125887" />
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
    color: '#e6eefb',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#111',
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
    color: '#111',
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
