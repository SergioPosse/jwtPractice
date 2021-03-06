import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.scss';
import moment from 'moment-timezone';

import DoctorList from './DoctorList'
import PatientList from './PatientList'
import Calendar from './Calendar'
import Appointments from './Appointments'

import ReactCardFlip from 'react-card-flip';


function App() {
  console.log("render app");

  const [isFlipped,setIsFlipped]=useState(false);
  const [isDisabled, setIsDisabled]=useState(true);

  const [visibleTimePicker,setVisibleTimePicker] = useState(false);
  const [hour,setHour] = useState("00");
  const [ minute, setMinute] = useState("00");
  const [description, setDescription] = useState("");

  //bubbly-button
  const animateButton = (e)=>{
    //reset animation
    e.target.classList.remove('animate');
    e.target.classList.add('animate');
    setTimeout(function(){
      e.target.classList.remove('animate');
    },700);
  };
  
  const bubblyButtons = document.getElementsByClassName("bubbly-button");
  
  for (var i = 0; i < bubblyButtons.length; i++) {
    bubblyButtons[i].addEventListener('click', (e)=>animateButton(e), false);
  }
  
  const selectHour = ()=>{
    let arr=[];
    for (let i=0;i<24;i++){
      if (i<10){
        arr.push(<option className="touch" key={i+"h"} value={"0"+i} onClick={ (e)=>setHour(e.target.value)}>{"0"+i}</option>);
      }
      else{
        arr.push(<option className="touch" key={i+"h"} value={i}>{i}</option>);
      }
    }
    return arr;
  }
  const selectMinute = ()=>{
    let arr=[];
    for (let i=0;i<60;i++){
      if(i<10){
        arr.push(<option className="touch" key={i+"m"} value={"0"+i}>{"0"+i}</option>);
      }
      else{
        arr.push(<option className="touch" key={i+"m"} value={i}>{i}</option>);
      }
    }
    return arr;
  }
  
  

  const dateRef = useRef();
  const patientRef = useRef();
  const doctorRef = useRef();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [doctors, setDoctors] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState({ id: null, text: moment().format("DD-MM-yyyy"), date: [], state: false } )
  const [selectedDoctor, setSelectedDoctor] = useState({ id: null, text:"Doctor: Ninguno!", state: false } );
  const [selectedPatient, setSelectedPatient] = useState({ id: null, text:"Ninguno!", state: false})

  const changeDoctor = async(data) => {
    setSelectedDoctor({ id: data._id, text: data.name + "-"+ data.speciality, state: true });

        let oldClass = doctorRef.current.className;
        doctorRef.current.className = doctorRef.current.className.concat(" pop-up");
        await setTimeout(()=>{doctorRef.current.className = oldClass+" success"},500);
  }

  const changePatient = async(data) => {
    setSelectedPatient({ id: data._id, dni: data.dni, text: data.name + "-"+ data.dni, state:true });
    let oldClass = patientRef.current.className;
        patientRef.current.className = patientRef.current.className.concat(" pop-up");
        await setTimeout(()=>{patientRef.current.className = oldClass+" success"},500);
  }

    useEffect(()=>{
          axios
            .get('http://localhost:666/medical-care-rioiv/doctors')
            .then(res=>{
              setDoctors(doctors => res.data)
            })
    },[])

    

    useEffect(()=>{
          axios
          .get('http://localhost:666/medical-care-rioiv/patients')
          .then(res=>{
            setPatients(patients => res.data);//al actualizar con patients state usememo en patientlist component renderiza sino no
            //porque use useMemo con dependencia de patientsp
          })
    },[])

    const loadAppointments = ()=>{
      axios
          .get('http://localhost:666/medical-care-rioiv/appointments')
          .then(res=>{
            setAppointments(res.data)
          })
    }

    useEffect(()=>{
         loadAppointments();
    },[])

    useEffect(()=>{

      if((selectedPatient.state===true) && (selectedDate.state===true) && (selectedDoctor.state===true)){
        setIsDisabled(false);
        console.log("check");
      }  

    },[selectedDoctor,selectedPatient,selectedDate]);

    

    const getDayClicked = async (date)=>{
        console.log("getDayClicked  ")
        await setSelectedDate({ text: date.day+"-"+date.month+"-"+date.year, date: date, state: true } );
        let oldClass = dateRef.current.className;
        dateRef.current.className = dateRef.current.className.concat(" pop-up");
        await setTimeout(()=>{dateRef.current.className = oldClass+" success"},500);
        
    }

    const handleTurnClick = ()=>{
      loadAppointments();
      setIsFlipped(!isFlipped);
    }

    const handleDateClick = async ()=>{
        let query = 'http://localhost:666/medical-care-rioiv/appointments/'+selectedDoctor.id
        let arrApp = []
        axios
        .get(query)
        .then(res=>{
            if(res.data.length>0){
              res.data.map((item)=>{
                let date1 = moment(item.acomplishDate.slice(0,10)).format("YYYY-MM-DD");
                let date2 = moment(`${selectedDate.date.year}-${selectedDate.date.month}-${selectedDate.date.day}`).format("YYYY-MM-DD");
                if(date1===date2){
                    arrApp.push(item);
                }
              });
            }
            setAppointments(arrApp);
        });
        await setIsFlipped(!isFlipped);
    }

    const createAppointment = ()=>{
      setVisibleTimePicker(!visibleTimePicker);

    }

    const confirmTime = ()=>{
      let time = hour+":"+minute;
      let date = moment(selectedDate.text, "DD-MM-YYYY").format("YYYY-MM-DD")
      let body = {
            patient: selectedPatient.id,
            doctor: selectedDoctor.id,
            acomplishDate: date,
            description: description,
            time: time
            }
      axios.post('http://localhost:666/medical-care-rioiv/appointments/new', body).then(response => {
        console.log("Turno guardado");
      })
      .catch(e => {
        console.log("error al guardar turno: "+e);
      });
      clearModalTime();
      setVisibleTimePicker(!visibleTimePicker);
    }

    const clearModalTime = ()=>{
      setVisibleTimePicker(!visibleTimePicker);
      setHour("00");
      setMinute("00");
      setDescription("");
    }

        return(
        <>
        <div className="back-op">

        <div className="inner-container">
            <div id="modal-time-picker" className={ visibleTimePicker? "visible" : "invisible" }>
              <div className="timer" style={{ display: "flex", flexDirection: "row"}}>
                <select className="touch" value={hour} onChange={ (e)=>setHour(e.target.value)}>
                  { selectHour() }
                </select>
                :
                <select className="touch" value={minute} onChange={ (e)=>setMinute(e.target.value)}>
                  { selectMinute() }
                </select>
              </div>
              <textarea className="touch" name="description" value={ description } onChange={ (e)=>setDescription(e.target.value) }></textarea> 
              <button className="touch" style={{ borderRadius:"5%",backgroundColor: "#84F26D", width:"75%", height: "10%", fontSize: "0.9em" }}onClick={ confirmTime } >Confirmar Turno</button>
              <button className="touch" style={{ borderRadius:"5%",backgroundColor: "#EC7070", width:"75%",height: "10%", fontSize: "0.9em" }}onClick={ clearModalTime } >Cancelar</button>
            </div>
            <div className="wrapper-left">
                <div className="doctor-list">
                    <DoctorList selectedDoctor={ selectedDoctor.id } changeDoctor={ changeDoctor } doctorsp={ doctors }/>
                </div>
                <div className="patient-list">
                    <PatientList selectedPatient={ selectedPatient.id } changePatient={ changePatient } patientsp={ patients } />
                </div>
            </div>
            <div className="wrapper-right">
                <div className="profile-header">
                    <div ref={ patientRef } className="selected-patient">{ 
                          selectedPatient.text 
                         }
                    </div>
                    <div ref={ dateRef } className="selected-date">{<> 
                          <span value={ selectedDate.text }>{ selectedDate.text }</span>
                          <button className="touch button-fancy" onClick={ handleDateClick }>Ver</button>
                          </>
                         }
                    </div>
                </div>
                <div className='schedule'>
                    <ReactCardFlip isFlipped={ isFlipped } flipDirection="vertical">
                      <Calendar 
                        isDisabled={ isDisabled } 
                        handleTurnClick={ handleTurnClick } 
                        doctorRef={ doctorRef } 
                        selectedDoctor={ selectedDoctor } 
                        getDayClicked={ getDayClicked } 
                        createAppointment={ createAppointment }
                        visibleTimePicker={ visibleTimePicker }
                        >
                      </Calendar>
                      <Appointments 
                        handleTurnClick={ handleTurnClick } 
                        appointments={ appointments }>
                      </Appointments>
                    </ReactCardFlip>
                </div>
            </div>
            
        </div>

        </div>
        </>
        )
    }
export default App