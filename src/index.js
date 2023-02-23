import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from "axios";
import getImg from './api/getImg'

getImg('cat+red+kitten').then(img=>{console.log(img);});


const DEBOUNCE_DELAY = 300;
