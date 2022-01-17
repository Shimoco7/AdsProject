@echo off


START /B node server.js

start chrome.exe http://localhost:8082/?screen=0
