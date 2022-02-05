import {Component, OnInit} from '@angular/core';
import {AppService} from '@services/app.service';

@Component({
    selector: 'app-menu-sidebar',
    templateUrl: './menu-sidebar.component.html',
    styleUrls: ['./menu-sidebar.component.scss']
})
export class MenuSidebarComponent implements OnInit {
    public user;
    public menu = MENU;

    constructor(public appService: AppService) {}

    ngOnInit() {
        this.user = this.appService.user;
    }
}

export const MENU = [
    {
        name: 'Inicio',
        path: ['/'],
        icon: ['fas fa-tachometer-alt']
    },
    {
        name: 'Diseños',
        path: ['/design'],
        icon: ['fas fa-map-marked-alt']
    },
    {
        name: 'Calendario',
        path: ['/calendar'],
        icon: ['fas fa-calendar']
    },
    {
        name: 'Presupuestos',
        path: ['/blank'],
        icon: ['fas fa-file-invoice-dollar']
    },
    {
        name: 'Configuración',
        children: [
            {
                name: 'Empresa',
                path: ['/sub-menu-1'],
                icon: ['far fa-building']
            },

            {
                name: 'Usuarios',
                path: ['/sub-menu-2'],
                icon: ['fas fa-users']
            }
        ],
        icon: ['fas fa-cogs']
    }
];
