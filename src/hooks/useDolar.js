import { useState, useEffect, useCallback } from "react";

const API_URL = "https://dolarapi.com/v1/dolares";
const CACHE_KEY = "dolar_coefficient";
const CACHE_TTL = 5 * 60 * 1000;

const DOLAR_BASE = 1505;
const FECHA_BASE = "18/07/2026";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

export function useDolar() {
  const [state, setState] = useState(() => {
    const cached = loadFromStorage();
    if (cached) {
      return {
        dolarActual: cached.lastDolar || DOLAR_BASE,
        coeficiente: cached.coeficiente || 1,
        fecha: cached.fecha || FECHA_BASE,
        loading: false,
        error: null,
      };
    }
    return {
      dolarActual: DOLAR_BASE,
      coeficiente: 1,
      fecha: FECHA_BASE,
      loading: true,
      error: null,
    };
  });

  const fetchDolar = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const oficial = data.find((d) => d.casa === "oficial");
      if (!oficial) throw new Error("Oficial not found");

      const ventaActual = oficial.venta;

      const stored = loadFromStorage();
      const coefGuardado = stored?.coeficiente || 1;
      const nuevoCoef = Math.max(coefGuardado, ventaActual / DOLAR_BASE);
      const coefRedondeado = Math.round(nuevoCoef * 10000) / 10000;

      const fechaActualizacion = new Date(oficial.fechaActualizacion);
      const fechaStr = fechaActualizacion.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      saveToStorage({
        lastDolar: ventaActual,
        coeficiente: coefRedondeado,
        fecha: fechaStr,
        fetchedAt: Date.now(),
      });

      setState({
        dolarActual: ventaActual,
        coeficiente: coefRedondeado,
        fecha: fechaStr,
        loading: false,
        error: null,
      });
    } catch (err) {
      const stored = loadFromStorage();
      setState((prev) => ({
        ...prev,
        dolarActual: stored?.lastDolar || DOLAR_BASE,
        coeficiente: stored?.coeficiente || 1,
        fecha: stored?.fecha || FECHA_BASE,
        loading: false,
        error: err.message,
      }));
    }
  }, []);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored && stored.fetchedAt && Date.now() - stored.fetchedAt < CACHE_TTL) {
      setState({
        dolarActual: stored.lastDolar || DOLAR_BASE,
        coeficiente: stored.coeficiente || 1,
        fecha: stored.fecha || FECHA_BASE,
        loading: false,
        error: null,
      });
      return;
    }

    fetchDolar();
    const interval = setInterval(fetchDolar, CACHE_TTL);
    return () => clearInterval(interval);
  }, [fetchDolar]);

  return {
    ...state,
    dolarBase: DOLAR_BASE,
    fechaBase: FECHA_BASE,
    refresh: fetchDolar,
  };
}
