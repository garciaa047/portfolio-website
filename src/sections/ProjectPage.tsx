import React from "react";
import { Globe } from "../components/Globe";
import { Tag } from "../components/Tag";
import { CornerMarks } from "../components/Decor";
import { Annotation, Asterism } from "../components/Apparatus";
import { LinkArrow } from "../components/LinkArrow";
import { SectionHeader } from "../components/SectionHeader";
import { DoodleLab } from "../components/doodle/DoodleLab";
import { ReplayTheater } from "../components/pandaplace/ReplayTheater";
import { TrainingChronicle } from "../components/pandaplace/TrainingChronicle";
import { projects } from "../data";

/**
 * ProjectPage: one project's dossier. Both pages run the real thing, the
 * trained network in the browser and real MuJoCo footage.
 */
export function ProjectPage({
  slug,
  theme,
  onToggleTheme,
}: {
  slug: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const project = projects.find((p) => p.slug === slug);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <DossierHeader theme={theme} onToggleTheme={onToggleTheme} />
      <main
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "var(--space-8) var(--gutter) var(--space-10)",
        }}
      >
        {!project ? (
          <NotFound slug={slug} />
        ) : (
          <>
            <SectionHeader
              index={project.index}
              eyebrow="Project dossier"
              title={project.title}
              lede={project.summary}
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "var(--space-2)",
                marginTop: "calc(-1 * var(--space-5))",
                marginBottom: "var(--space-7)",
              }}
            >
              {project.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
              {project.github && (
                <LinkArrow
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  direction="up-right"
                  style={{ marginLeft: "var(--space-3)" }}
                >
                  Code
                </LinkArrow>
              )}
            </div>

            {slug === "doodle-classifier" && <DoodleBody theme={theme} />}
            {slug === "pandaplace" && <PandaPlaceBody />}
          </>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Doodle classifier: the live network, then method notes.             */

function DoodleBody({ theme }: { theme: "light" | "dark" }) {
  return (
    <>
      <p
        style={{
          maxWidth: "var(--measure)",
          color: "var(--text-body)",
          lineHeight: "var(--leading-relaxed)",
          marginBottom: "var(--space-6)",
        }}
      >
        The trained weights, running in your browser. Draw in the tray and
        the sketch is preprocessed and pushed through the network every
        70&nbsp;ms. The activations you see are real.
      </p>

      <DoodleLab theme={theme} />

      <Asterism
        style={{
          display: "block",
          textAlign: "center",
          margin: "var(--space-8) 0 var(--space-6)",
        }}
      />

      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        <MethodNote n="i" title="The network">
          900, 128, 64, 5. That is 123,909 parameters in raw NumPy: He
          initialization, leaky ReLU, softmax, cross-entropy with L2, and
          mini-batch gradient descent with momentum.
        </MethodNote>
        <MethodNote n="ii" title="What it sees">
          Your sketch is inverted, cropped to its bounding box, scaled into a
          24-pixel box, and centered on a 30×30 canvas. Same pipeline the
          training data went through.
        </MethodNote>
        <MethodNote n="iii" title="The red ink">
          An attribution map: each input pixel times the gradient of the
          winning class against it, from a backward pass run in the browser.
          It marks the strokes that decided the call.
        </MethodNote>
        <MethodNote n="iv" title="The recorder">
          The strip chart tracks the softmax head over time. Draw a circle and
          watch <em>apple</em> and <em>clock</em> fight. Add hands and it
          settles.
        </MethodNote>
      </div>
    </>
  );
}

function MethodNote({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        paddingTop: "var(--space-4)",
        borderTop: "var(--border-hair)",
      }}
    >
      <span className="mono-label">
        note {n} · {title}
      </span>
      <p
        style={{
          color: "var(--text-body)",
          lineHeight: "var(--leading-relaxed)",
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PandaPlaceRL: real rollouts, the training curves, method notes.     */

function PandaPlaceBody() {
  return (
    <>
      <p
        style={{
          maxWidth: "var(--measure)",
          color: "var(--text-body)",
          lineHeight: "var(--leading-relaxed)",
          marginBottom: "var(--space-6)",
        }}
      >
        The trained policy in MuJoCo, rendered straight from the simulator.
        Red sphere is the goal, blue cube is the object. Hover a clip for
        full colour.
      </p>

      <FramedMark caption="Fig. 2a. Tabs pick the evaluation suite, dots pick the episode.">
        <ReplayTheater size={300} />
      </FramedMark>

      <Asterism
        style={{
          display: "block",
          textAlign: "center",
          margin: "var(--space-8) 0 var(--space-6)",
        }}
      />

      <FramedMark caption="Fig. 2b. Success rate, with curriculum stages ruled in. Click a tick for footage of the policy at that point in training.">
        <TrainingChronicle />
      </FramedMark>

      <div
        className="about-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-6)",
          marginTop: "var(--space-7)",
        }}
      >
        <MethodNote n="i" title="The problem">
          A Franka Panda, a 4&nbsp;cm cube, and a sparse reward: −1 every step
          until the cube sits within 5&nbsp;cm of the goal, and most goals are
          in the air. The policy commands Cartesian displacements, resolved to
          joint targets by damped least-squares Jacobian IK, plus a gripper
          channel. No demonstrations, no shaping.
        </MethodNote>
        <MethodNote n="ii" title="The learner">
          SAC with hindsight experience replay, so a failed episode gets
          relabeled as if wherever it landed had been the goal. Six curriculum
          stages widen the task from reach to full randomization, each gated
          on a rolling success rate.
        </MethodNote>
        <MethodNote n="iii" title="The hard part">
          Random exploration almost never produces a grasp, and HER cannot
          relabel toward states that never happen. That is the flat lift curve
          in Fig.&nbsp;2b. Two things break it: goal ranges that overlap
          between stages, so each stage is nearly solvable by the last one's
          skill, and starting a fraction of episodes with the cube already in
          the closed gripper.
        </MethodNote>
        <MethodNote n="iv" title="The result">
          96 to 100% across three held-out suites of 50 episodes, with object
          and goal fully randomized, in about 400k steps and 1.5 hours on CPU.
          85% of goals need a real grasp and lift. The last stage turns off
          every aid, so these are cold-start rollouts of the policy above.
        </MethodNote>
      </div>

      <Annotation style={{ marginTop: "var(--space-6)" }}>
        second attempt at this problem. Rebuilt from scratch, and this time
        it worked.
      </Annotation>
    </>
  );
}

function FramedMark({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        margin: 0,
        padding: "var(--space-5)",
        background: "var(--surface-raised)",
        border: "var(--border-hair)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <CornerMarks opacity={0.35} />
      {children}
      <figcaption
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--label-sm)",
          letterSpacing: "var(--tracking-mono)",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div style={{ padding: "var(--space-8) 0" }}>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          color: "var(--text-soft)",
          fontSize: "var(--text-xl)",
        }}
      >
        No dossier filed under “{slug}.”
      </p>
      <p style={{ marginTop: "var(--space-4)" }}>
        <LinkArrow href="#projects">Back to the catalog</LinkArrow>
      </p>
    </div>
  );
}

function DossierHeader({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "var(--border-hair)",
        background: "color-mix(in srgb, var(--surface-page) 85%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "var(--space-3) var(--gutter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#projects"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <Globe size={28} graticule={false} whirl={false} detail="outline" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--label-sm)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            ← Back to the catalog
          </span>
        </a>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "var(--radius-sm)",
            border: "var(--border-hair)",
            background: "transparent",
            color: "var(--text-soft)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-base)",
            lineHeight: 1,
          }}
        >
          {theme === "light" ? "☾" : "☀"}
        </button>
      </div>
    </header>
  );
}
