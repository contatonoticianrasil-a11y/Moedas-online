/* =========================================================
   GONÇALVES CÂMBIO
   anuncio.js
   PROPAGANDA DE ENTRADA
========================================================= */

(function () {

  "use strict";

  /* =======================================================
     CONFIGURAÇÕES
  ======================================================= */

  const TEMPO_PARA_MOSTRAR = 800;

  const TEMPO_REABRIR = 10 * 60 * 1000; // 10 minutos


  /* =======================================================
     CRIAR ESTILO
  ======================================================= */

  const estilo = document.createElement("style");

  estilo.textContent = `

    #goncalves-anuncio-overlay {

      position: fixed;

      inset: 0;

      width: 100%;
      height: 100%;

      background: rgba(0, 0, 0, 0.65);

      display: flex;

      align-items: center;

      justify-content: center;

      z-index: 999999;

      padding: 15px;

      box-sizing: border-box;

    }


    #goncalves-anuncio {

      position: relative;

      width: min(92vw, 420px);

      min-height: 180px;

      background: #ffffff;

      border-radius: 14px;

      box-shadow:
        0 15px 50px rgba(0,0,0,0.35);

      overflow: hidden;

      display: flex;

      align-items: center;

      justify-content: center;

      text-align: center;

      box-sizing: border-box;

    }


    #goncalves-anuncio-fechar {

      position: absolute;

      top: 8px;

      right: 8px;

      width: 30px;

      height: 30px;

      border: none;

      border-radius: 50%;

      background: rgba(0,0,0,0.7);

      color: #ffffff;

      font-size: 18px;

      line-height: 30px;

      text-align: center;

      cursor: pointer;

      z-index: 10;

    }


    #goncalves-anuncio-fechar:hover {

      background: rgba(0,0,0,0.9);

    }


    #goncalves-anuncio-conteudo {

      width: 100%;

      padding: 25px 15px;

      box-sizing: border-box;

    }


    #goncalves-anuncio-titulo {

      font-size: 12px;

      color: #777;

      margin-bottom: 12px;

    }


    #goncalves-anuncio-banner {

      width: 100%;

      min-height: 120px;

      display: flex;

      align-items: center;

      justify-content: center;

      background: #f5f5f5;

      border-radius: 8px;

      overflow: hidden;

    }


    #goncalves-anuncio-banner img {

      display: block;

      max-width: 100%;

      height: auto;

    }


    @media (max-width: 600px) {

      #goncalves-anuncio {

        width: 94vw;

        min-height: 160px;

        border-radius: 12px;

      }

    }

  `;

  document.head.appendChild(estilo);


  /* =======================================================
     VERIFICAR SE PODE MOSTRAR
  ======================================================= */

  function podeMostrar() {

    try {

      const ultimaExibicao =
        localStorage.getItem(
          "goncalves_anuncio_ultima_exibicao"
        );

      if (!ultimaExibicao) {

        return true;

      }

      const agora =
        Date.now();

      const ultima =
        Number(ultimaExibicao);

      return (
        agora - ultima >=
        TEMPO_REABRIR
      );

    } catch (erro) {

      return true;

    }

  }


  /* =======================================================
     MARCAR EXIBIÇÃO
  ======================================================= */

  function marcarExibicao() {

    try {

      localStorage.setItem(
        "goncalves_anuncio_ultima_exibicao",
        Date.now().toString()
      );

    } catch (erro) {

      console.warn(
        "Não foi possível salvar o controle do anúncio."
      );

    }

  }


  /* =======================================================
     FECHAR ANÚNCIO
  ======================================================= */

  function fecharAnuncio() {

    const overlay =
      document.getElementById(
        "goncalves-anuncio-overlay"
      );

    if (!overlay) return;


    overlay.style.opacity = "0";

    overlay.style.transition =
      "opacity 0.2s ease";


    setTimeout(
      function () {

        if (overlay) {

          overlay.remove();

        }

      },
      200
    );

  }


  /* =======================================================
     CRIAR ANÚNCIO
  ======================================================= */

  function criarAnuncio() {

    if (!podeMostrar()) {

      return;

    }


    marcarExibicao();


    const overlay =
      document.createElement("div");

    overlay.id =
      "goncalves-anuncio-overlay";


    overlay.innerHTML = `

      <div
        id="goncalves-anuncio"
        role="dialog"
        aria-label="Publicidade"
      >

        <button
          id="goncalves-anuncio-fechar"
          type="button"
          aria-label="Fechar anúncio"
        >
          ×
        </button>


        <div id="goncalves-anuncio-conteudo">

          <div id="goncalves-anuncio-titulo">
            PUBLICIDADE
          </div>


          <div id="goncalves-anuncio-banner">

            <!-- =========================================
                 COLOQUE O CÓDIGO DO ADSENSE AQUI
            ========================================== -->

            <span
              style="
                color:#888;
                font-size:13px;
              "
            >
              Espaço para publicidade
            </span>

          </div>

        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    const fechar =
      document.getElementById(
        "goncalves-anuncio-fechar"
      );


    if (fechar) {

      fechar.addEventListener(
        "click",
        fecharAnuncio
      );

    }


    /*
      Também permite fechar
      clicando fora da propaganda.
    */

    overlay.addEventListener(
      "click",
      function (evento) {

        if (
          evento.target === overlay
        ) {

          fecharAnuncio();

        }

      }
    );


    /*
      ESC fecha a propaganda.
    */

    document.addEventListener(
      "keydown",
      function fecharComESC(evento) {

        if (
          evento.key === "Escape"
        ) {

          fecharAnuncio();

          document.removeEventListener(
            "keydown",
            fecharComESC
          );

        }

      }
    );

  }


  /* =======================================================
     INICIAR
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      function () {

        setTimeout(
          criarAnuncio,
          TEMPO_PARA_MOSTRAR
        );

      }
    );

  } else {

    setTimeout(
      criarAnuncio,
      TEMPO_PARA_MOSTRAR
    );

  }

})();
