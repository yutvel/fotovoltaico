import { Component, OnInit, Injectable } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/angular';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

@Injectable({
  providedIn: 'root'
})
export class CalendarComponent  implements OnInit {

  calendarVisible = true;
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },

    allDayText: 'Todo el Día',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    themeSystem: 'bootstrap',
    locale: 'es',
    firstDay: 1,
    droppable : true, 
    slotDuration:'00:30:00',
    businessHours: [ 
      {
        daysOfWeek: [ 1, 2, 3, 4, 5], // Monday, Tuesday, Wednesday
        startTime: '08:00', // 8am
        endTime: '18:00' // 6pm
      },
      {
        daysOfWeek: [ 6 ], // Thursday, Friday
        startTime: '10:00', // 10am
        endTime: '16:00' // 4pm
      }
    ],
  
    initialView: 'dayGridMonth',
    initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)

    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */

  };

  currentEvents: EventApi[] = [];

  constructor(private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Nombre del Evento');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        extendedProps: {'dato': 3},
        color: '#FF0A00'
      });
      this.toastr.success('Evento Agregado', 'Exito');
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`Estas seguro que quieres borrarlo ? '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
      this.toastr.success('Evento Borrado', 'Exito');
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  handleDateClick(arg) {
    alert('Dia clickeado! ' + arg.dateStr)
  }



 
}