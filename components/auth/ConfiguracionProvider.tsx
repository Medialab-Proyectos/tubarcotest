"use client";

import { createContext, useContext } from "react";

interface Configuracion {
  /** Modo demostración: se entra con el código 0000 y sin correo. */
  demo: boolean;
}

const ConfiguracionContext = createContext<Configuracion>({ demo: false });

/** Lleva al navegador los interruptores que decide el servidor.
 *
 *  Existe por un fallo real: el modo demostración se leía con
 *  `process.env.NEXT_PUBLIC_DEMO_AUTH` desde un componente de cliente, y eso se
 *  congela en el momento de compilar. Si el servidor arrancó antes de que la
 *  variable existiera —o el navegador tenía cargado un paquete anterior—, la
 *  aplicación se pasaba en silencio al acceso por correo de verdad y el 0000
 *  respondía "el código no es correcto", sin pista de por qué.
 *
 *  El layout es componente de servidor: lee la variable en cada render, con el
 *  valor que de verdad tiene el proceso, y la pasa aquí ya resuelta. */
export default function ConfiguracionProvider({
  demo,
  children,
}: {
  demo: boolean;
  children: React.ReactNode;
}) {
  return (
    <ConfiguracionContext.Provider value={{ demo }}>
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracion(): Configuracion {
  return useContext(ConfiguracionContext);
}
