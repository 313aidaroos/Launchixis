# Company motion assets

These are existing completed Higgsfield / Seedance 2.5 generations, reused on 2026-10-05 without a new generation charge. Original still artwork and CSS crop mappings are preserved as fallbacks.

| Files | Higgsfield job |
| --- | --- |
| `halaxis.mp4`, `launchixis.mp4` | `021c17b7-6471-4541-a946-a3e6aeb4d0d2` |
| `lyrixis.mp4`, `pinixis.mp4`, `renoxis.mp4` | `b56b0007-a204-475d-899e-14ee9c585e2b` |
| `contraxis.mp4`, `deduxis.mp4`, `rawixis.mp4` | `2116d724-44bb-4d7e-89d9-8b30cc59d800` |
| `apixis.mp4`, `apixis-wallet.mp4`, `socixis.mp4` | `04ea151c-26e7-4fa2-a269-0f9886617c9b` |
| `recovra.mp4` | `80d442d8-499d-4ccf-8e5b-f714ca399d4b` |
| `geoxis.mp4`, `ominix.mp4`, `wattixis.mp4` | `be17da6b-bdf8-466b-b952-a37f2a62e92d` |

Each source clip is about four seconds. Sprite panels were cropped at their actual visual boundaries (30%/70%, except the music/arcade/real-estate clip at 35%/65%), excluding adjacent scenes. Exports are silent H.264, 24fps, yuv420p, CRF 25 and fast-start, 512px square except Recovra at 640px wide. The browser covers the card art region with each clip. All fifteen files together are under 2 MB.

CompanyMotion loads clips only when their cards enter view, pauses offscreen/hidden-tab clips, and preserves the still illustrations for reduced motion, data saver, slow 2G connections, failed playback and JavaScript-disabled visitors. The page-level pause setting is saved locally.

