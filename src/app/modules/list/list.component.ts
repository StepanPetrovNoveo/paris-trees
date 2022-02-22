import {Component, OnInit, ViewChild} from '@angular/core';
import {
  API_URL
} from "../../../../src/config";
import {ChartComponent} from "angular2-chartjs";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})


export class ListComponent implements OnInit {
  finalList: any;
  genreNumberList: any;
  graph: any;
  rows = 20;
  start = 0;
  type = 'line';
  data = {
    labels: [],
    datasets: [
      {
        label: "Genre Group",
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: []
      }
    ]
  };
  options = {
    responsive: true,
    maintainAspectRatio: false
  };
  @ViewChild('chartComponent', {static: false}) chartComponent: ChartComponent;

  constructor() {
  }

  ngOnInit(): void {
    console.log(API_URL)
    const endpoint = `${API_URL}&rows=${this.rows}&start=${this.start}`;
    this.fetchItems(endpoint);
  }

  fetchItems(endpoint) {
    fetch(endpoint)
      .then(result => result.json())
      .then(result => {
        console.log(result)
        const data = result?.records.map(x => x.fields);
        const groupByArrondissement = data.reduce((group, property) => {
          const {arrondissement} = property;
          group[arrondissement] = group[arrondissement] ?? [];
          group[arrondissement].push(arrondissement);
          return group;
        }, {});

        function toArray(object) {
          const keys = Object.keys(object);
          const values = Object.values(object);
          const result = [];
          for (let i = 0; i < keys.length; i++) {
            // @ts-ignore
            result.push({name: keys[i], count: values[i].length})
          }
          return result;
        }

        this.finalList = toArray(groupByArrondissement);
        this.finalList.sort(function (a, b) {
          if (a.count > b.count) {
            return -1;
          }
          if (a.count < b.count) {
            return 1;
          }
          return 0;
        });

        //getting genre list
        const groupByGenre = data.reduce((group, property) => {
          const {genre} = property;
          group[genre] = group[genre] ?? [];
          group[genre].push(genre);
          return group;
        }, {});

        this.genreNumberList = toArray(groupByGenre);
        this.genreNumberList.sort(function (a, b) {
          if (a.count > b.count) {
            return -1;
          }
          if (a.count < b.count) {
            return 1;
          }
          return 0;
        });

        this.data.labels = this.genreNumberList.map(x => x.name);
        this.data.datasets[0].data = this.genreNumberList.map(x => x.count);
        this.chartComponent.chart.update()
      });
  }

}

