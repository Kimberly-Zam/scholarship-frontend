import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Asegúrate de importar CommonModule

@Component({
  selector: 'app-cards',
  standalone: true,  // Asegura que el componente es standalone
  imports: [CommonModule],  // Agrega CommonModule aquí
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  // Datos de ejemplo de becas
  scholarships = [
    { title: 'Beca para Maestría en Tecnología', 
      data: ['Plazo: 30 de septiembre', 'País: Estados Unidos', 'Nivel: Maestría'],
      pais: 'bolivia' },
    { title: 'Beca de Investigación Científica', 
      data: ['Plazo: 15 de agosto', 'País: Alemania', 'Nivel: Doctorado'],
      pais: '' },
    { title: 'Beca para Programadores Junior', 
      data: ['Plazo: 1 de octubre', 'País: Argentina', 'Nivel: Pregrado'],
      pais: '' },
    ];

  constructor() { }

  ngOnInit(): void { }

}
