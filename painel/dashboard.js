/* =========================================================
   GONÇALVES CÂMBIO
   DASHBOARD PROFISSIONAL
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
   ELEMENTOS
========================================================= */

const usuarioLogado =
  document.getElementById("usuarioLogado");

const totalAds =
  document.getElementById("totalAds");

const activeAds =
  document.getElementById("activeAds");

const inactiveAds =
  document.getElementById("inactiveAds");

const adsList =
  document.getElementById("adsList");

const allAdsGrid =
  document.getElementById("allAdsGrid");

const modalOverlay =
  document.getElementById("modalOverlay");

const adForm =
  document.getElementById("adForm");

const newAdBtn =
  document.getElementById("newAdBtn");

const newAdBtnBottom =
  document.getElementById("newAdBtnBottom");

const closeModalBtn =
  document.getElementById("closeModalBtn");

const cancelBtn =
  document.getElementById("cancelBtn");

const refreshBtn =
  document.getElementById("refreshBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const imageInput =
  document.getElementById("imagem_url");

const imagePreview =
  document.getElementById("imagePreview");

const ativoInput =
  document.getElementById("ativo");

const statusLabel =
  document.getElementById("statusLabel");

const formMessage =
  document.getElementById("formMessage");

const toast =
  document.getElementById("toast");

let anuncios = [];


/* =========================================================
   LOGIN
========================================================= */

async function verificarLogin() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getSession();

  if (error) {

    console.error(error);

    window.location.href =
      "index.html";

    return false;
  }

  if (!data.session) {

    window.location.href =
      "index.html";

    return false;
  }

  if (usuarioLogado) {

    usuarioLogado.textContent =
      data.session.user.email ||
      "Administrador";

  }

  return true;
}


/* =========================================================
   CARREGAR ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  if (adsList) {

    adsList.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        Carregando propagandas...
      </div>
    `;

  }

  if (allAdsGrid) {

    allAdsGrid.innerHTML = "";

  }

  const {
    data,
    error
  } =
    await supabaseClient
      .from("anuncios")
      .select("*")
      .order("id", {
        ascending: false
      });


  if (error) {

    console.error(
      "Erro Supabase:",
      error
    );

    if (adsList) {

      adsList.innerHTML = `
        <div class="loading">
          ❌ Erro ao carregar anúncios.
        </div>
      `;

    }

    if (allAdsGrid) {

      allAdsGrid.innerHTML = `
        <div class="loading">
          ❌ Não foi possível carregar.
          <br>
          <small>${escapeHTML(error.message)}</small>
        </div>
      `;

    }

    atualizarResumo([]);

    return;
  }


  anuncios =
    data || [];


  atualizarResumo(
    anuncios
  );

  renderRecentes(
    anuncios.slice(0, 5)
  );

  renderTodos(
    anuncios
  );

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo(lista) {

  const total =
    lista.length;

  const ativos =
    lista.filter(
      item => item.ativo === true
    ).length;

  const inativos =
    total - ativos;


  if (totalAds) {

    totalAds.textContent =
      total;

  }

  if (activeAds) {

    activeAds.textContent =
      ativos;

  }

  if (inactiveAds) {

    inactiveAds.textContent =
      inativos;

  }


  const legendTotal =
    document.getElementById(
      "legendTotal"
    );

  const legendActive =
    document.getElementById(
      "legendActive"
    );

  const legendInactive =
    document.getElementById(
      "legendInactive"
    );


  if (legendTotal)
    legendTotal.textContent = total;

  if (legendActive)
    legendActive.textContent = ativos;

  if (legendInactive)
    legendInactive.textContent = inativos;


  const percent =
    total > 0
      ? Math.round(
          (ativos / total) * 100
        )
      : 0;


  const activePercent =
    document.getElementById(
      "activePercent"
    );

  if (activePercent)
    activePercent.textContent =
      percent + "%";


  const donut =
    document.querySelector(
      ".donut"
    );

  if (donut) {

    donut.style.background =
      `
      conic-gradient(
        var(--green) 0 ${percent}%,
        #24364e ${percent}% 100%
      )
      `;

  }


  const alertActiveText =
    document.getElementById(
      "alertActiveText"
    );

  const alertInactiveText =
    document.getElementById(
      "alertInactiveText"
    );


  if (alertActiveText) {

    alertActiveText.textContent =
      ativos === 0
        ? "Nenhum anúncio ativo"
        : `${ativos} anúncio${ativos === 1 ? "" : "s"} ativo${ativos === 1 ? "" : "s"}`;

  }


  if (alertInactiveText) {

    alertInactiveText.textContent =
      inativos === 0
        ? "Nenhum anúncio inativo"
        : `${inativos} anúncio${inativos === 1 ? "" : "s"} inativo${inativos === 1 ? "" : "s"}`;

  }

}


/* =========================================================
   PROPAGANDAS RECENTES
========================================================= */

function renderRecentes(lista) {

  if (!adsList) return;


  if (lista.length === 0) {

    adsList.innerHTML = `
      <div class="loading">
        📢
        <br>
        Nenhuma propaganda cadastrada.
      </div>
    `;

    return;
  }


  adsList.innerHTML =
    lista.map(
      criarLinhaAnuncio
    ).join("");

}


/* =========================================================
   LINHA DO ANÚNCIO
========================================================= */

function criarLinhaAnuncio(anuncio) {

  const imagem =
    anuncio.imagem_url ||
    "https://via.placeholder.com/600x300/142238/ffffff?text=Goncalves+Cambio";


  return `

    <div class="ad-row">

      <img
        class="ad-thumb"
        src="${escapeAttribute(imagem)}"
        alt="Propaganda"
        onerror="
          this.src='https://via.placeholder.com/600x300/142238/ffffff?text=Sem+imagem'
        "
      >

      <div>

        <h3>
          ${escapeHTML(
            anuncio.titulo ||
            "Sem título"
          )}
        </h3>

        <p>
          ${escapeHTML(
            anuncio.descricao ||
            "Sem descrição"
          )}
        </p>

      </div>

      <span
        class="ad-status ${
          anuncio.ativo
            ? "active"
            : "inactive"
        }"
      >
        ${
          anuncio.ativo
            ? "ATIVO"
            : "INATIVO"
        }
      </span>

    </div>

  `;

}


/* =========================================================
   TODOS OS ANÚNCIOS
========================================================= */

function renderTodos(lista) {

  if (!allAdsGrid) return;


  if (lista.length === 0) {

    allAdsGrid.innerHTML = `
      <div class="loading">
        📢
        <br>
        Nenhuma propaganda cadastrada.
      </div>
    `;

    return;
  }


  allAdsGrid.innerHTML =
    lista.map(
      criarCardCompleto
    ).join("");

}


/* =========================================================
   CARD COMPLETO
========================================================= */

function criarCardCompleto(anuncio) {

  const imagem =
    anuncio.imagem_url ||
    "https://via.placeholder.com/600x300/142238/ffffff?text=Goncalves+Cambio";


  return `

    <article
      class="full-ad-card"
      data-title="${escapeAttribute(
        anuncio.titulo || ""
      )}"
    >

      <img
        src="${escapeAttribute(imagem)}"
        alt="${escapeAttribute(
          anuncio.titulo || "Propaganda"
        )}"
        onerror="
          this.src='https://via.placeholder.com/600x300/142238/ffffff?text=Sem+imagem'
        "
      >


      <div class="full-ad-body">

        <span
          class="ad-status ${
            anuncio.ativo
              ? "active"
              : "inactive"
          }"
        >
          ${
            anuncio.ativo
              ? "ATIVO"
              : "INATIVO"
          }
        </span>


        <h3>
          ${escapeHTML(
            anuncio.titulo ||
            "Sem título"
          )}
        </h3>


        <p>
          ${escapeHTML(
            anuncio.descricao ||
            "Sem descrição"
          )}
        </p>


        <div class="ad-buttons">

          <button
            class="edit-ad"
            onclick="editarAnuncio(${anuncio.id})"
          >
            ✏️ Editar
          </button>

          <button
            class="toggle-ad"
            onclick="
              alternarAnuncio(
                ${anuncio.id},
                ${!anuncio.ativo}
              )
            "
          >
            ${
              anuncio.ativo
                ? "Desativar"
                : "Ativar"
            }
          </button>

          <button
            class="delete-ad"
            onclick="
              excluirAnuncio(
                ${anuncio.id}
              )
            "
          >
            🗑️
          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal(anuncio = null) {

  if (!modalOverlay) return;


  adForm.reset();


  document.getElementById(
    "adId"
  ).value =
    anuncio
      ? anuncio.id
      : "";


  document.getElementById(
    "titulo"
  ).value =
    anuncio?.titulo || "";


  document.getElementById(
    "imagem_url"
  ).value =
    anuncio?.imagem_url || "";


  document.getElementById(
    "link_url"
  ).value =
    anuncio?.link_url || "";


  document.getElementById(
    "descricao"
  ).value =
    anuncio?.descricao || "";


  document.getElementById(
    "tempo_minutos"
  ).value =
    anuncio?.tempo_minutos ?? 0;


  document.getElementById(
    "ativo"
  ).checked =
    anuncio
      ? anuncio.ativo === true
      : true;


  document.getElementById(
    "modalTitle"
  ).textContent =
    anuncio
      ? "Editar propaganda"
      : "Nova propaganda";


  formMessage.textContent = "";


  atualizarStatusLabel();

  atualizarPreview();


  modalOverlay.classList.remove(
    "hidden"
  );

}


function fecharModal() {

  if (modalOverlay) {

    modalOverlay.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   PREVIEW DA IMAGEM
========================================================= */

function atualizarPreview() {

  if (!imagePreview) return;


  const url =
    imageInput?.value.trim();


  if (!url) {

    imagePreview.innerHTML =
      "<span>Prévia da imagem</span>";

    return;
  }


  imagePreview.innerHTML = `

    <img
      src="${escapeAttribute(url)}"
      alt="Prévia"
      onerror="
        this.parentElement.innerHTML='<span>Imagem não encontrada</span>'
      "
    >

  `;

}


if (imageInput) {

  imageInput.addEventListener(
    "input",
    atualizarPreview
  );

}


/* =========================================================
   STATUS
========================================================= */

function atualizarStatusLabel() {

  if (!ativoInput || !statusLabel)
    return;


  statusLabel.textContent =
    ativoInput.checked
      ? "Ativo"
      : "Inativo";


  statusLabel.style.color =
    ativoInput.checked
      ? "var(--green)"
      : "var(--red)";

}


if (ativoInput) {

  ativoInput.addEventListener(
    "change",
    atualizarStatusLabel
  );

}


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio(event) {

  event.preventDefault();


  formMessage.textContent = "";


  const id =
    document.getElementById(
      "adId"
    ).value;


  const titulo =
    document.getElementById(
      "titulo"
    ).value.trim();


  const imagem =
    document.getElementById(
      "imagem_url"
    ).value.trim();


  const link =
    document.getElementById(
      "link_url"
    ).value.trim();


  const descricao =
    document.getElementById(
      "descricao"
    ).value.trim();


  const tempo =
    Number(
      document.getElementById(
        "tempo_minutos"
      ).value || 0
    );


  const ativo =
    document.getElementById(
      "ativo"
    ).checked;


  if (!titulo) {

    formMessage.textContent =
      "Digite o título da propaganda.";

    return;
  }


  if (!link) {

    formMessage.textContent =
      "Digite o link da propaganda.";

    return;
  }


  const dados = {

    titulo,

    imagem_url:
      imagem || null,

    link_url:
      link,

    descricao:
      descricao || null,

    ativo,

    tempo_minutos:
      Number.isFinite(tempo)
        ? Math.max(0, tempo)
        : 0,

    atualizado_em:
      new Date().toISOString()

  };


  const saveBtn =
    document.getElementById(
      "saveBtn"
    );


  saveBtn.disabled = true;

  saveBtn.textContent =
    "⏳ Salvando...";


  try {

    let resultado;


    if (id) {

      resultado =
        await supabaseClient
          .from("anuncios")
          .update(dados)
          .eq("id", id);

    } else {

      resultado =
        await supabaseClient
          .from("anuncios")
          .insert([dados]);

    }


    if (resultado.error)
      throw resultado.error;


    fecharModal();

    mostrarToast(
      id
        ? "Propaganda atualizada!"
        : "Propaganda criada!"
    );


    await carregarAnuncios();


  } catch (erro) {

    console.error(erro);

    formMessage.textContent =
      "Erro ao salvar: " +
      erro.message;


  } finally {

    saveBtn.disabled = false;

    saveBtn.textContent =
      "💾 Salvar propaganda";

  }

}


/* =========================================================
   EDITAR
========================================================= */

async function editarAnuncio(id) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("anuncios")
      .select("*")
      .eq("id", id)
      .single();


  if (error) {

    mostrarToast(
      "Erro ao carregar propaganda."
    );

    console.error(error);

    return;
  }


  abrirModal(data);

}


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alternarAnuncio(
  id,
  status
) {

  const {
    error
  } =
    await supabaseClient
      .from("anuncios")
      .update({
        ativo: status,
        atualizado_em:
          new Date().toISOString()
      })
      .eq("id", id);


  if (error) {

    console.error(error);

    mostrarToast(
      "Não foi possível alterar."
    );

    return;
  }


  mostrarToast(
    status
      ? "Propaganda ativada."
      : "Propaganda desativada."
  );


  await carregarAnuncios();

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(id) {

  if (
    !confirm(
      "Deseja realmente excluir esta propaganda?"
    )
  ) return;


  const {
    error
  } =
    await supabaseClient
      .from("anuncios")
      .delete()
      .eq("id", id);


  if (error) {

    console.error(error);

    mostrarToast(
      "Não foi possível excluir."
    );

    return;
  }


  mostrarToast(
    "Propaganda excluída."
  );


  await carregarAnuncios();

}


/* =========================================================
   PESQUISA
========================================================= */

function pesquisarAnuncios(valor) {

  const termo =
    valor
      .toLowerCase()
      .trim();


  const filtrados =
    anuncios.filter(
      anuncio =>
        String(
          anuncio.titulo || ""
        )
          .toLowerCase()
          .includes(termo)
    );


  renderTodos(
    filtrados
  );

}


const adSearch =
  document.getElementById(
    "adSearch"
  );


if (adSearch) {

  adSearch.addEventListener(
    "input",
    function() {

      pesquisarAnuncios(
        this.value
      );

    }
  );

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

document
  .querySelectorAll(".nav-item")
  .forEach(
    item => {

      item.addEventListener(
        "click",
        function() {

          document
            .querySelectorAll(
              ".nav-item"
            )
            .forEach(
              n =>
                n.classList.remove(
                  "active"
                )
            );


          this.classList.add(
            "active"
          );


          const section =
            this.dataset.section;


          if (
            section ===
            "propagandas"
          ) {

            document
              .getElementById(
                "propagandasSection"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth"
              });

          }


          if (
            section ===
            "dashboard"
          ) {

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

          }

        }
      );

    }
  );


/* =========================================================
   BOTÕES
========================================================= */

if (newAdBtn) {

  newAdBtn.addEventListener(
    "click",
    () => abrirModal()
  );

}


if (newAdBtnBottom) {

  newAdBtnBottom.addEventListener(
    "click",
    () => abrirModal()
  );

}


if (closeModalBtn) {

  closeModalBtn.addEventListener(
    "click",
    fecharModal
  );

}


if (cancelBtn) {

  cancelBtn.addEventListener(
    "click",
    fecharModal
  );

}


if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    carregarAnuncios
  );

}


const viewAdsBtn =
  document.getElementById(
    "viewAdsBtn"
  );


if (viewAdsBtn) {

  viewAdsBtn.addEventListener(
    "click",
    function() {

      document
        .getElementById(
          "propagandasSection"
        )
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }
  );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async function() {

      logoutBtn.disabled = true;

      logoutBtn.textContent =
        "Saindo...";


      await supabaseClient
        .auth
        .signOut({
          scope: "local"
        });


      window.location.href =
        "index.html";

    }
  );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function mostrarToast(mensagem) {

  if (!toast) return;


  toast.textContent =
    mensagem;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escapeHTML(valor) {

  return String(valor)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(valor) {

  return escapeHTML(valor);

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    const autenticado =
      await verificarLogin();


    if (!autenticado)
      return;


    await carregarAnuncios();

  }
);


/* =========================================================
   FUNÇÕES GLOBAIS
========================================================= */

window.abrirModal =
  abrirModal;

window.editarAnuncio =
  editarAnuncio;

window.alternarAnuncio =
  alternarAnuncio;

window.excluirAnuncio =
  excluirAnuncio;
