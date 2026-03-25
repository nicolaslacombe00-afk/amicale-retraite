import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/src/lib/auth/session'
import { loginAction } from '@/src/app/login/actions'

const errorMessages: Record<string, string> = {
  invalid: 'Email ou mot de passe incorrect.',
  missing: 'Renseigne ton email et ton mot de passe.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const user = await getAuthenticatedUser()

  if (user) {
    redirect('/')
  }

  const params = await searchParams
  const error = params.error ? errorMessages[params.error] ?? null : null

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eef3f7_0%,#f8fafc_46%,#eef0ff_100%)] px-6 py-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_520px] lg:gap-0 lg:px-0 lg:py-0">
      <section className="hidden min-h-screen flex-col justify-between bg-[linear-gradient(160deg,#243143_0%,#27364a_60%,#182331_100%)] p-12 text-white lg:flex xl:p-16">
        <div>
          <div className="text-[44px] font-black italic tracking-[-0.14em]">R·A·G·T</div>
          <div className="mt-2 h-px w-16 bg-white/70" />
        </div>

        <div className="max-w-xl">
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.24em] text-emerald-300/80">
            Intranet de l&apos;amicale
          </p>
          <h1 className="text-5xl font-extrabold leading-tight">
            Un espace simple pour tous les membres de l&apos;Amicale des Retraites RAGT.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/72">
            Connecte-toi pour consulter les actualites, les rendez-vous de l&apos;amicale et les informations
            reservees aux membres. Les administrateurs disposent ensuite d&apos;un acces de gestion dedie.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm font-semibold text-white/90">Comptes de demonstration</p>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Admin: `admin@amicale-ragt.local` / `Admin2030!`
            <br />
            Membre: `membre@amicale-ragt.local` / `Membre2030!`
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[520px] rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="text-[36px] font-black italic tracking-[-0.14em] text-[#243143]">R·A·G·T</div>
            <div className="mt-2 h-px w-14 bg-[#243143]/30" />
          </div>

          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#99a3b4]">
            Connexion membre
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#182235]">Se connecter</h2>
          <p className="mt-3 text-[16px] leading-7 text-[#667289]">
            Entre tes identifiants pour acceder a l&apos;espace de l&apos;Amicale.
          </p>

          <form action={loginAction} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="h-14 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[16px] text-[#223048] outline-none transition focus:border-[#0f9d6b]"
                placeholder="jean-pierre@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Mot de passe</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="h-14 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[16px] text-[#223048] outline-none transition focus:border-[#0f9d6b]"
                placeholder="Ton mot de passe"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f9d6b] px-5 py-4 text-[16px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
            >
              Acceder a l&apos;intranet
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
