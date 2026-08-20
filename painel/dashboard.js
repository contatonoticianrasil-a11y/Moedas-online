/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL DE PROPAGANDAS
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";


/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   FUNÇÃO AUXILIAR
========================================================= */

function $(id) {
  return document.getElementById(id);
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

    if (error) {
      console.error(error);
      window.location.href = "index.html";
      return false;
    }

    if (!data.session) {
      window.location.href = "index.html";
      return false;
    }

    const usuario =
      $("usuarioLogado");

    if (usuario) {

      usuario.textContent =
        data.session.user.email ||
        "Administrador";

    }

    return true;

  } catch (erro) {

    console.error(
      "Erro ao verificar login:",
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

  const loading =
    $("loading");

  const errorState =
    $("errorState");

  const emptyState =
    $("emptyState");

  const grid =
    $("adsGrid");

  if (!grid) return;


  if (loading) {
    loading.classList.remove("hidden");
  }

  if (errorState) {
    errorState.classList.add("hidden");
  }

  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  grid.innerHTML = "";


  try {

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
      throw error;
    }


    if (loading) {
      loading.classList.add("hidden");
    }


    atualizarResumo(
      data || []
    );


    if (!data || data.length === 0) {

      if (emptyState) {
        emptyState.classList.remove("hidden");
      }

      return;
    }


    renderizarAnuncios(
      data
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar anúncios:",
      erro
    );


    if (loading) {
      loading.classList.add("hidden");
    }


    if (errorState) {

      errorState.classList.remove(
        "hidden"
      );

      $("errorMessage").textContent =
        erro.message ||
        "Erro desconhecido.";

    }

  }
}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo(
  anuncios
) {

  const total =
    anuncios.length;

  const ativos =
    anuncios.filter(
      anuncio =>
        anuncio.ativo === true
    ).length;

  const inativos =
    total - ativos;


  if ($("totalAds")) {
    $("totalAds").textContent =
      total;
  }

  if ($("activeAds")) {
    $("activeAds").textContent =
      ativos;
  }

  if ($("inactiveAds")) {
    $("inactiveAds").textContent =
      inativos;
  }
}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderizarAnuncios(
  anuncios
) {

  const grid =
    $("adsGrid");

  if (!grid) return;


  const pesquisa =
    $("searchInput")
      ?.value
      .trim()
      .toLowerCase() || "";


  const filtrados =
    anuncios.filter(
      anuncio => {

        const titulo =
          String(
            anuncio.titulo || ""
          ).toLowerCase();

        const descricao =
          String(
            anuncio.descricao || ""
          ).toLowerCase();

        return (
          titulo.includes(pesquisa) ||
          descricao.includes(pesquisa)
        );

      }
    );


  if (filtrados.length === 0) {

    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔎</div>
        <h3>Nenhum resultado</h3>
        <p>
          Nenhuma propaganda corresponde à pesquisa.
        </p>
      </div>
    `;

    return;
  }


  grid.innerHTML =
    filtrados
      .map(
        criarCard
      )
      .join("");
}


/* =========================================================
   CARD
========================================================= */

function criarCard(
  anuncio
) {

  const ativo =
    anuncio.ativo === true;

  const imagem =
    anuncio.imagem_url ||
    "https://via.placeholder.com/800x450?text=Goncalves+Cambio";


  return `

    <article class="ad-card">

      <div class="ad-image">

        <img
          src="${escapeHTML(imagem)}"
          alt="${escapeHTML(
            anuncio.titulo ||
            "Propaganda"
          )}"
          onerror="
            this.src='https://via.placeholder.com/800x450?text=Imagem+indisponivel'
          "
        >

        <span class="${
          ativo
            ? "status-ativo"
            : "status-inativo"
        }">

          ${
            ativo
              ? "🟢 Ativo"
              : "🔴 Inativo"
          }

        </span>

      </div>


      <div class="ad-content">

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

        <div class="ad-link">

          🔗

          ${escapeHTML(
            anuncio.link_url ||
            "Sem link"
          )}

        </div>


        <div class="ad-footer">

          <button
            class="edit-btn"
            type="button"
            onclick="editarAnuncio(${anuncio.id})"
          >
            ✏️ Editar
          </button>


          <button
            class="toggle-btn"
            type="button"
            onclick="alternarAnuncio(
              ${anuncio.id},
              ${!ativo}
            )"
          >

            ${
              ativo
                ? "🔴 Desativar"
                : "🟢 Ativar"
            }

          </button>


          <button
            class="delete-btn"
            type="button"
            onclick="excluirAnuncio(${anuncio.id})"
          >
            🗑️ Excluir
          </button>

        </div>

      </div>

    </article>

  `;
}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal(
  anuncio = null
) {

  const modal =
    $("modalOverlay");

  const form =
    $("adForm");

  if (!modal || !form) {

    console.error(
      "Modal não encontrado."
    );

    return;
  }


  form.reset();


  $("adId").value =
    anuncio
      ? anuncio.id
      : "";


  $("titulo").value =
    anuncio?.titulo || "";


  $("imagem_url").value =
    anuncio?.imagem_url || "";


  $("link_url").value =
    anuncio?.link_url || "";


  $("descricao").value =
    anuncio?.descricao || "";


  $("intervalo_minutos").value =
    anuncio?.tempo_minutos ?? 0;


  $("ativo").checked =
    anuncio
      ? anuncio.ativo === true
      : true;


  $("modalTitle").textContent =
    anuncio
      ? "Editar propaganda"
      : "Nova propaganda";


  atualizarStatusText();

  atualizarPreview();


  modal.classList.remove(
    "hidden"
  );

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

  const modal =
    $("modalOverlay");

  if (!modal) return;

  modal.classList.add(
    "hidden"
  );

  $("formMessage").textContent =
    "";

}


/* =========================================================
   PREVIEW
========================================================= */

function atualizarPreview() {

  const url =
    $("imagem_url")
      ?.value
      .trim();

  const preview =
    $("imagePreview");

  const imagem =
    $("previewImg");


  if (!preview || !imagem) {
    return;
  }


  if (!url) {

    preview.classList.add(
      "hidden"
    );

    imagem.removeAttribute(
      "src"
    );

    return;
  }


  imagem.src =
    url;

  preview.classList.remove(
    "hidden"
  );
}


/* =========================================================
   STATUS
========================================================= */

function atualizarStatusText() {

  const checkbox =
    $("ativo");

  const texto =
    $("statusText");

  if (!checkbox || !texto) {
    return;
  }

  texto.textContent =
    checkbox.checked
      ? "Ativo"
      : "Inativo";
}


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio(
  event
) {

  event.preventDefault();


  const id =
    $("adId").value;


  const titulo =
    $("titulo")
      .value
      .trim();


  const imagem =
    $("imagem_url")
      .value
      .trim();


  const link =
    $("link_url")
      .value
      .trim();


  const descricao =
    $("descricao")
      .value
      .trim();


  const intervalo =
    Number(
      $("intervalo_minutos")
        .value || 0
    );


  const ativo =
    $("ativo")
      .checked;


  const mensagem =
    $("formMessage");


  const botao =
    $("saveBtn");


  if (!titulo) {

    mensagem.textContent =
      "Digite o título da propaganda.";

    mensagem.className =
      "form-message error";

    return;
  }


  if (!link) {

    mensagem.textContent =
      "Digite o link da propaganda.";

    mensagem.className =
      "form-message error";

    return;
  }


  const dados = {

    titulo:
      titulo,

    imagem_url:
      imagem || null,

    link_url:
      link,

    descricao:
      descricao || null,

    intervalo_minutos:
      Number.isFinite(intervalo)
        ? Math.max(
            0,
            intervalo
          )
        : 0,

    ativo:
      ativo

  };


  try {

    botao.disabled =
      true;

    botao.textContent =
      "⏳ Salvando...";


    let resultado;


    if (id) {

      resultado =
        await supabaseClient
          .from("anuncios")
          .update(dados)
          .eq(
            "id",
            id
          );

    } else {

      resultado =
        await supabaseClient
          .from("anuncios")
          .insert([
            dados
          ]);

    }


    if (resultado.error) {
      throw resultado.error;
    }


    fecharModal();

    await carregarAnuncios();


    mostrarToast(
      id
        ? "Propaganda atualizada com sucesso!"
        : "Propaganda criada com sucesso!"
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar propaganda:",
      erro
    );


    mensagem.textContent =
      "Erro ao salvar: " +
      erro.message;


    mensagem.className =
      "form-message error";


  } finally {

    botao.disabled =
      false;

    botao.textContent =
      "💾 Salvar propaganda";

  }
}


/* =========================================================
   EDITAR
========================================================= */

async function editarAnuncio(
  id
) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .eq(
          "id",
          id
        )
        .single();


    if (error) {
      throw error;
    }


    abrirModal(
      data
    );


  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível carregar a propaganda.",
      true
    );

  }
}


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alternarAnuncio(
  id,
  novoStatus
) {

  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .update({
          ativo:
            novoStatus
        })
        .eq(
          "id",
          id
        );


    if (error) {
      throw error;
    }


    await carregarAnuncios();


    mostrarToast(
      novoStatus
        ? "Propaganda ativada!"
        : "Propaganda desativada!"
    );


  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível alterar o status.",
      true
    );

  }
}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(
  id
) {

  if (
    !confirm(
      "Tem certeza que deseja excluir esta propaganda?"
    )
  ) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {
      throw error;
    }


    await carregarAnuncios();


    mostrarToast(
      "Propaganda excluída!"
    );


  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível excluir.",
      true
    );

  }
}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
  texto,
  erro = false
) {

  const toast =
    $("toast");

  if (!toast) {
    alert(texto);
    return;
  }


  toast.textContent =
    texto;


  toast.className =
    erro
      ? "toast show error"
      : "toast show";


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
   ESCAPAR HTML
========================================================= */

function escapeHTML(
  valor
) {

  return String(
    valor ?? ""
  )
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


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {


    if ($("year")) {
      $("year").textContent =
        new Date()
          .getFullYear();
    }


    const autenticado =
      await verificarLogin();


    if (!autenticado) {
      return;
    }


    /* NOVA PROPAGANDA */

    $("newAdBtn")
      ?.addEventListener(
        "click",
        function() {
          abrirModal();
        }
      );


    $("emptyNewBtn")
      ?.addEventListener(
        "click",
        function() {
          abrirModal();
        }
      );


    /* FECHAR */

    $("closeModalBtn")
      ?.addEventListener(
        "click",
        fecharModal
      );


    $("cancelBtn")
      ?.addEventListener(
        "click",
        fecharModal
      );


    /* FORMULÁRIO */

    $("adForm")
      ?.addEventListener(
        "submit",
        salvarAnuncio
      );


    /* IMAGEM */

    $("imagem_url")
      ?.addEventListener(
        "input",
        atualizarPreview
      );


    /* STATUS */

    $("ativo")
      ?.addEventListener(
        "change",
        atualizarStatusText
      );


    /* ATUALIZAR */

    $("refreshBtn")
      ?.addEventListener(
        "click",
        carregarAnuncios
      );


    $("retryBtn")
      ?.addEventListener(
        "click",
        carregarAnuncios
      );


    $("refreshMenu")
      ?.addEventListener(
        "click",
        function(event) {

          event.preventDefault();

          carregarAnuncios();

        }
      );


    /* LOGOUT */

    $("logoutBtn")
      ?.addEventListener(
        "click",
        async function() {

          await supabaseClient
            .auth
            .signOut({
              scope: "local"
            });

          window.location.href =
            "index.html";

        }
      );


    /* FECHAR AO CLICAR FORA */

    $("modalOverlay")
      ?.addEventListener(
        "click",
        function(event) {

          if (
            event.target ===
            $("modalOverlay")
          ) {

            fecharModal();

          }

        }
      );


    /* PESQUISA */

    $("searchInput")
      ?.addEventListener(
        "input",
        carregarAnuncios
      );


    /* CARREGAR */

    await carregarAnuncios();

  }
);


/* =========================================================
   FUNÇÕES GLOBAIS
========================================================= */

window.abrirModal =
  abrirModal;

window.fecharModal =
  fecharModal;

window.editarAnuncio =
  editarAnuncio;

window.alternarAnuncio =
  alternarAnuncio;

window.excluirAnuncio =
  excluirAnuncio;
