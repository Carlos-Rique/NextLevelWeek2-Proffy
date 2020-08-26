import React, { useState } from 'react'
import { View, Text, AsyncStorage } from 'react-native';

import styles from './styles';
import PageHeader from '../../components/PageHeader';
import TeacherItem, { Teacher } from '../../components/TeacherItem';
import { ScrollView, TextInput, BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Feather } from "@expo/vector-icons/";
import api from '../../services/api';

function TeacherList() {

  const [ isFilterVisible, setFilterVisible ] = useState(false);
  const [subject, setSubject] = useState("");
  const [week_day, setWeekDay] = useState("");
  const [time, setTime] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  function loadFavorites() {
    AsyncStorage.getItem("favorites").then((response) => {
      if (response) {
        const favoritedTeachers = JSON.parse(response);
        const favoritedTeachersIds = favoritedTeachers.map(
          (teacher: Teacher) => {
            return teacher.id;
          }
        );

        setFavorites(favoritedTeachersIds);
      }
    });
  }

  function handleToggleFiltersVisible() {
    // const setFilterVisibl = !isFilterVisible
    setFilterVisible(!isFilterVisible)
  }

  async function handleFiltersSubmit() {
    loadFavorites();
    const response = await api.get("classes", {
      params: {
        subject,
        week_day,
        time,
      },
    });

    setFilterVisible(false);
    setTeachers(response.data);
  }

  return (
    <View style={styles.container}>
      <PageHeader 
        title="Proffys disponíveis"
        headerRight={(
          <BorderlessButton onPress={handleToggleFiltersVisible}>
             <Feather name="filter" size={35} color="#FFF" />
          </BorderlessButton>
        )}
      >
        {isFilterVisible &&
          <View style={styles.searchForm}>
            <Text style={styles.label}>Matéria</Text>
            <TextInput 
              value={subject}
              onChangeText={(text) => setSubject(text)}
              style={styles.input}
              placeholder="Qual a matéria?"
            />

            <View style={styles.inputGroup}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Dia da Semana</Text>
                <TextInput
                  value={week_day}
                  onChangeText={(text) => setWeekDay(text)}
                  style={styles.input}
                  placeholder='Qual o dia?'
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Horário</Text>
                <TextInput
                  value={time}
                  onChangeText={(text) => setTime(text)}
                  style={styles.input}
                  placeholder='Qual o horário?'
                />
              </View>
            </View>

            <RectButton
              onPress={handleFiltersSubmit}
              style={styles.submitButton}
            >
               <Text style={styles.submitButtonText}>Filtrar</Text>
            </RectButton>

          </View>
        }
      </PageHeader>

      <ScrollView
        style={styles.teacherList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}  
      >
        {teachers.map((teacher: Teacher) => {
          return <TeacherItem key={teacher.id} favorited={favorites.includes(teacher.id)} teacher={teacher} />
        })}
      </ScrollView>


    </View>
  )
}

export default TeacherList;