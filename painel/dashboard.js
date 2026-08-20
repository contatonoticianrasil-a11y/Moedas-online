/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL PROFISSIONAL DE PROPAGANDAS
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   ESTADO
========================================================= */

let anuncios = [];

let anuncioEditando = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const adsGrid =
  document.getElementById("adsGrid");

const loading =
  document.getElementById("loading");

const emptyState =
  document.getElementById("emptyState");

const modalOverlay =
  document.getElementById("modalOverlay");

const adForm =
  document.getElementById("adForm");

const searchInput =
  document.getElementById("searchInput");

const formMessage =
  document.getElementById("formMessage");

const toast =
  document.getElementById("toast");


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function mostrarToast(
  mensagem,
  tipo = "success"
) {

  if (!toast) return;

  clearTimeout(toastTimer);

  toast.textContent =
    mensagem;

  toast.className =
    "toast show " + tipo;

  toastTimer =
    setTimeout(
      function() {

        toast.className =
          "toast";

      },
      3000
    );

}


/* =========================================================
   MENSAGEM DO FORMULÁRIO
========================================================= */

function mostrarMensagem(
  mensagem,
  tipo = ""
) {

  if (!formMessage) return;

  formMessage.textContent =
    mensagem;

  formMessage.className =
    "form-message " + tipo;

}


/* =========================================================
   LOGIN
========================================================= */

async function verificarLogin() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .getSession();

    if (
      error ||
      !data ||
      !data.session
    ) {

      window.location.href =
        "index.html";

      return false;

    }

    const email =
      data.session.user.email ||
      "Administrador";

    const usuario =
      document.getElementById(
        "usuarioLogado"
      );

    if (usuario) {

      usuario.textContent =
        email;

    }

    return true;

  } catch (erro) {

    console.error(
      "Erro de autenticação:",
      erro
    );

    window.location.href =
      "index.html";

    return false;

  }

}


/* =========================================================
   CARREGAR ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  mostrarLoading();

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) {

      throw error;

    }

    anuncios =
      data || [];

    atualizarEstatisticas();

    renderizarAnuncios(
      anuncios
    );

  } catch (erro) {

    console.error(
      "Erro ao carregar anúncios:",
      erro
    );

    esconderLoading();

    if (adsGrid) {

      adsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>

          <h3>Não foi possível carregar</h3>

          <p>
            Verifique se a tabela
            <strong>anuncios</strong>
            existe no Supabase.
          </p>
        </div>
      `;

    }

  }

}


/* =========================================================
   LOADING
========================================================= */

function mostrarLoading() {

  if (loading) {

    loading.classList.remove(
      "hidden"
    );

  }

  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }

  if (adsGrid) {

    adsGrid.innerHTML = "";

  }

}


function esconderLoading() {

  if (loading) {

    loading.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

function atualizarEstatisticas() {

  const total =
    anuncios.length;

  const ativos =
    anuncios.filter(
      anuncio =>
        anuncio.ativo === true
    ).length;

  const inativos =
    total - ativos;


  const totalElement =
    document.getElementById(
      "totalAds"
    );

  const activeElement =
    document.getElementById(
      "activeAds"
    );

  const inactiveElement =
    document.getElementById(
      "inactiveAds"
    );


  if (totalElement) {

    totalElement.textContent =
      total;

  }

  if (activeElement) {

    activeElement.textContent =
      ativos;

  }

  if (inactiveElement) {

    inactiveElement.textContent =
      inativos;

  }

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderizarAnuncios(
  lista
) {

  esconderLoading();

  if (!adsGrid) return;


  if (!lista.length) {

    adsGrid.innerHTML = "";

    if (emptyState) {

      emptyState.classList.remove(
        "hidden"
      );

    }

    return;

  }


  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }


  adsGrid.innerHTML = "";


  lista.forEach(
    function(anuncio) {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "ad-card";


      const imagem =
        anuncio.imagem_url
          ? `
            <img
              src="${escaparHTML(
                anuncio.imagem_url
              )}"
              alt="${escaparHTML(
                anuncio.titulo ||
                "Propaganda"
              )}"
              onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=&quot;no-image&quot;>🖼️ Imagem indisponível</span>';"
            >
          `
          : `
            <span class="no-image">
              🖼️ Sem imagem
            </span>
          `;


      const status =
        anuncio.ativo === true
          ? `
            <span class="status-badge status-active">
              ● ATIVO
            </span>
          `
          : `
            <span class="status-badge status-inactive">
              ● INATIVO
            </span>
          `;


      const descricao =
        anuncio.descricao ||
        "Sem descrição cadastrada.";


      const link =
        anuncio.link_url ||
        "";


      card.innerHTML = `

        <div class="ad-image">
          ${imagem}
        </div>

        <div class="ad-body">

          <div class="ad-title-row">

            <div class="ad-title">
              ${escaparHTML(
                anuncio.titulo ||
                "Sem título"
              )}
            </div>

            ${status}

          </div>

          <p class="ad-description">
            ${escaparHTML(
              descricao
            )}
          </p>

          ${
            link
              ? `
                <a
                  class="ad-link"
                  href="${escaparHTML(
                    link
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 ${escaparHTML(link)}
                </a>
              `
              : `
                <span class="ad-link">
                  🔗 Nenhum link cadastrado
                </span>
              `
          }

          <div class="ad-actions">

            <button
              class="ad-action"
              data-action="toggle"
              data-id="${anuncio.id}"
            >
              ${
                anuncio.ativo
                  ? "🔴 Desativar"
                  : "🟢 Ativar"
              }
            </button>

            <button
              class="ad-action"
              data-action="edit"
              data-id="${anuncio.id}"
            >
              ✏️ Editar
            </button>

            <button
              class="ad-action delete"
              data-action="delete"
              data-id="${anuncio.id}"
            >
              🗑️ Excluir
            </button>

          </div>

        </div>

      `;


      adsGrid.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal(
  anuncio = null
) {

  anuncioEditando =
    anuncio;

  const modalTitle =
    document.getElementById(
      "modalTitle"
    );

  const adId =
    document.getElementById(
      "adId"
    );

  const titulo =
    document.getElementById(
      "titulo"
    );

  const imagem =
    document.getElementById(
      "imagem_url"
    );

  const link =
    document.getElementById(
      "link_url"
    );

  const descricao =
    document.getElementById(
      "descricao"
    );

  const intervalo =
    document.getElementById(
      "intervalo_minutos"
    );

  const ativo =
    document.getElementById(
      "ativo"
    );


  if (anuncio) {

    modalTitle.textContent =
      "Editar propaganda";

    adId.value =
      anuncio.id || "";

    titulo.value =
      anuncio.titulo || "";

    imagem.value =
      anuncio.imagem_url || "";

    link.value =
      anuncio.link_url || "";

    descricao.value =
      anuncio.descricao || "";

    intervalo.value =
      anuncio.intervalo_minutos ?? 0;

    ativo.checked =
      anuncio.ativo === true;

  } else {

    modalTitle.textContent =
      "Nova propaganda";

    adForm.reset();

    adId.value =
      "";

    intervalo.value =
      "0";

    ativo.checked =
      true;

  }


  atualizarStatusTexto();

  atualizarPreview();


  modalOverlay.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";


  setTimeout(
    function() {

      titulo.focus();

    },
    100
  );

}


function fecharModal() {

  modalOverlay.classList.add(
    "hidden"
  );

  document.body.style.overflow =
    "";

  anuncioEditando =
    null;

  mostrarMensagem("");

}


/* =========================================================
   PREVIEW DA IMAGEM
========================================================= */

function atualizarPreview() {

  const url =
    document.getElementById(
      "imagem_url"
    ).value.trim();

  const preview =
    document.getElementById(
      "imagePreview"
    );

  const image =
    document.getElementById(
      "previewImg"
    );


  if (
    !url ||
    !preview ||
    !image
  ) {

    if (preview) {

      preview.classList.add(
        "hidden"
      );

    }

    return;

  }


  image.src =
    url;

  preview.classList.remove(
    "hidden"
  );

}


/* =========================================================
   STATUS TEXTO
========================================================= */

function atualizarStatusTexto() {

  const ativo =
    document.getElementById(
      "ativo"
    );

  const texto =
    document.getElementById(
      "statusText"
    );

  if (!ativo || !texto) return;

  texto.textContent =
    ativo.checked
      ? "Ativo"
      : "Inativo";

}


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio(
  evento
) {

  evento.preventDefault();


  const saveBtn =
    document.getElementById(
      "saveBtn"
    );


  const id =
    document.getElementById(
      "adId"
    ).value;


  const dados = {

    titulo:
      document.getElementById(
        "titulo"
      ).value.trim(),

    imagem_url:
      document.getElementById(
        "imagem_url"
      ).value.trim() || null,

    link_url:
      document.getElementById(
        "link_url"
      ).value.trim() || null,

    descricao:
      document.getElementById(
        "descricao"
      ).value.trim() || null,

    ativo:
      document.getElementById(
        "ativo"
      ).checked,

    intervalo_minutos:
      Number(
        document.getElementById(
          "intervalo_minutos"
        ).value
      ) || 0

  };


  if (!dados.titulo) {

    mostrarMensagem(
      "Digite o título da propaganda.",
      "error"
    );

    return;

  }


  saveBtn.disabled =
    true;

  saveBtn.textContent =
    "⏳ Salvando...";


  try {

    let resposta;


    if (id) {

      resposta =
        await supabaseClient
          .from("anuncios")
          .update(dados)
          .eq("id", id)
          .select()
          .single();

    } else {

      resposta =
        await supabaseClient
          .from("anuncios")
          .insert(dados)
          .select()
          .single();

    }


    if (resposta.error) {

      throw resposta.error;

    }


    fecharModal();

    mostrarToast(
      id
        ? "Propaganda atualizada com sucesso!"
        : "Propaganda criada com sucesso!",
      "success"
    );


    await carregarAnuncios();


  } catch (erro) {

    console.error(
      "Erro ao salvar:",
      erro
    );

    mostrarMensagem(
      "Não foi possível salvar. Verifique a tabela anuncios e as permissões do Supabase.",
      "error"
    );

  } finally {

    saveBtn.disabled =
      false;

    saveBtn.textContent =
      "💾 Salvar propaganda";

  }

}


/* =========================================================
   EDITAR
========================================================= */

function editarAnuncio(
  id
) {

  const anuncio =
    anuncios.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!anuncio) {

    mostrarToast(
      "Propaganda não encontrada.",
      "error"
    );

    return;

  }

  abrirModal(
    anuncio
  );

}


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alternarStatus(
  id
) {

  const anuncio =
    anuncios.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!anuncio) return;


  try {

    const novoStatus =
      !anuncio.ativo;


    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .update({
          ativo: novoStatus
        })
        .eq(
          "id",
          anuncio.id
        );


    if (error) {

      throw error;

    }


    mostrarToast(
      novoStatus
        ? "Propaganda ativada!"
        : "Propaganda desativada!",
      "success"
    );


    await carregarAnuncios();


  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível alterar o status.",
      "error"
    );

  }

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(
  id
) {

  const anuncio =
    anuncios.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!anuncio) return;


  const confirmar =
    window.confirm(
      `Deseja realmente excluir a propaganda "${anuncio.titulo}"?`
    );


  if (!confirmar) return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .delete()
        .eq(
          "id",
          anuncio.id
        );


    if (error) {

      throw error;

    }


    mostrarToast(
      "Propaganda excluída.",
      "success"
    );


    await carregarAnuncios();


  } catch (erro) {

    console.error(
      "Erro ao excluir:",
      erro
    );

    mostrarToast(
      "Não foi possível excluir.",
      "error"
    );

  }

}


/* =========================================================
   PESQUISA
========================================================= */

function pesquisar() {

  const termo =
    searchInput.value
      .trim()
      .toLowerCase();


  if (!termo) {

    renderizarAnuncios(
      anuncios
    );

    return;

  }


  const filtrados =
    anuncios.filter(
      function(anuncio) {

        return (

          String(
            anuncio.titulo || ""
          )
            .toLowerCase()
            .includes(termo)

          ||

          String(
            anuncio.descricao || ""
          )
            .toLowerCase()
            .includes(termo)

          ||

          String(
            anuncio.link_url || ""
          )
            .toLowerCase()
            .includes(termo)

        );

      }
    );


  renderizarAnuncios(
    filtrados
  );

}


/* =========================================================
   EVENTOS DOS CARDS
========================================================= */

if (adsGrid) {

  adsGrid.addEventListener(
    "click",
    function(event) {

      const botao =
        event.target.closest(
          "button[data-action]"
        );

      if (!botao) return;


      const acao =
        botao.dataset.action;

      const id =
        botao.dataset.id;


      if (acao === "edit") {

        editarAnuncio(id);

      }

      else if (
        acao === "toggle"
      ) {

        alternarStatus(id);

      }

      else if (
        acao === "delete"
      ) {

        excluirAnuncio(id);

      }

    }
  );

}


/* =========================================================
   LOGOUT
========================================================= */

async function sair() {

  const botao =
    document.getElementById(
      "logoutBtn"
    );


  if (botao) {

    botao.disabled =
      true;

    botao.textContent =
      "Saindo...";

  }


  try {

    await supabaseClient
      .auth
      .signOut({
        scope: "local"
      });

  } catch (erro) {

    console.error(
      "Erro ao sair:",
      erro
    );

  }


  window.location.href =
    "index.html";

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    const year =
      document.getElementById(
        "year"
      );

    if (year) {

      year.textContent =
        new Date()
          .getFullYear();

    }


    const autenticado =
      await verificarLogin();


    if (!autenticado) {

      return;

    }


    await carregarAnuncios();


    /* NOVO */

    const newAdBtn =
      document.getElementById(
        "newAdBtn"
      );

    if (newAdBtn) {

      newAdBtn.addEventListener(
        "click",
        function() {

          abrirModal();

        }
      );

    }


    const emptyNewBtn =
      document.getElementById(
        "emptyNewBtn"
      );

    if (emptyNewBtn) {

      emptyNewBtn.addEventListener(
        "click",
        function() {

          abrirModal();

        }
      );

    }


    /* FECHAR */

    const closeModalBtn =
      document.getElementById(
        "closeModalBtn"
      );

    if (closeModalBtn) {

      closeModalBtn.addEventListener(
        "click",
        fecharModal
      );

    }


    const cancelBtn =
      document.getElementById(
        "cancelBtn"
      );

    if (cancelBtn) {

      cancelBtn.addEventListener(
        "click",
        fecharModal
      );

    }


    /* FORM */

    if (adForm) {

      adForm.addEventListener(
        "submit",
        salvarAnuncio
      );

    }


    /* PESQUISA */

    if (searchInput) {

      searchInput.addEventListener(
        "input",
        pesquisar
      );

    }


    /* STATUS */

    const ativo =
      document.getElementById(
        "ativo"
      );

    if (ativo) {

      ativo.addEventListener(
        "change",
        atualizarStatusTexto
      );

    }


    /* PREVIEW */

    const imagem =
      document.getElementById(
        "imagem_url"
      );

    if (imagem) {

      imagem.addEventListener(
        "input",
        atualizarPreview
      );

    }


    /* ATUALIZAR */

    const refreshBtn =
      document.getElementById(
        "refreshBtn"
      );

    if (refreshBtn) {

      refreshBtn.addEventListener(
        "click",
        function() {

          carregarAnuncios();

        }
      );

    }


    const refreshMenu =
      document.getElementById(
        "refreshMenu"
      );

    if (refreshMenu) {

      refreshMenu.addEventListener(
        "click",
        function(event) {

          event.preventDefault();

          carregarAnuncios();

        }
      );

    }


    /* LOGOUT */

    const logoutBtn =
      document.getElementById(
        "logoutBtn"
      );

    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        sair
      );

    }


    /* ESC */

    document.addEventListener(
      "keydown",
      function(event) {

        if (
          event.key === "Escape" &&
          !modalOverlay.classList.contains(
            "hidden"
          )
        ) {

          fecharModal();

        }

      }
    );


    /* CLIQUE FORA DO MODAL */

    if (modalOverlay) {

      modalOverlay.addEventListener(
        "click",
        function(event) {

          if (
            event.target ===
            modalOverlay
          ) {

            fecharModal();

          }

        }
      );

    }

  }
);
