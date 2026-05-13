import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  AfterViewInit,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-agent',
  standalone: true,
  template: `
    <div class="graph-wrapper">
      <svg #graphContainer></svg>
      @if (activeMenu(); as menu) {
        <div
          class="context-menu"
          [style.left.px]="menu.x"
          [style.top.px]="menu.y"
        >
          <button (click)="setAccess(menu.node.id, 'solid')">
            Grant Full Access
          </button>
          <button (click)="setAccess(menu.node.id, 'dashed')">
            Grant Partial Access
          </button>
          <button (click)="setAccess(menu.node.id, 'none')">
            Revoke Access
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .graph-wrapper {
        width: 100vw;
        height: 100vh;
        background: #0d1117;
        overflow: hidden;
      }
      .context-menu {
        position: absolute;
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 100;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }
      .context-menu button {
        background: transparent;
        border: none;
        color: #c9d1d9;
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        font-size: 12px;
        border-radius: 4px;
      }
      .context-menu button:hover {
        background: #21262d;
        color: #58a6ff;
      }
    `,
  ],
})
export class AgentComponent implements AfterViewInit {
  @ViewChild('graphContainer') container!: ElementRef<SVGSVGElement>;

  activeMenu = signal<{ node: any; x: number; y: number } | null>(null);

  graphData = signal<any>({
    nodes: [
      { id: 'center', name: 'Code Copilot', type: 'ai-core' },
      {
        id: 'p1',
        name: 'Mei Tanaka',
        type: 'user',
        access: 90,
        img: '/images/profile-old.png',
      },
      {
        id: 'p2',
        name: 'Liam Chen',
        type: 'user',
        access: 45,
        img: '/images/profile-old.png',
      },
      {
        id: 'p3',
        name: 'Peter Gitoons',
        type: 'user',
        access: 75,
        img: '/images/profile-old.png',
      },
      {
        id: 'p4',
        name: 'Isabelle Moreau',
        type: 'user',
        access: 20,
        img: '/images/profile-old.png',
      },
      {
        id: 'p5',
        name: 'Vikram Singh',
        type: 'user',
        access: 100,
        img: '/images/profile-old.png',
      },
      { id: 'priv', name: '4 Core Privileges', type: 'security-hub' },
      { id: 'git_access', name: 'Gitt.ab Access', type: 'resource-blue' },
      { id: 'github_ent', name: 'GitHub Enterprise', type: 'resource-blue' },
      { id: 'ide_auth', name: 'IDE Plugin Auth', type: 'resource-blue' },
      { id: 'repo_read', name: 'REPOSITORY_READ', type: 'permission-orange' },
      { id: 'core_lib', name: 'Core-Library.', type: 'permission-orange' },
      { id: 'sec_mod', name: 'Security_Module.', type: 'permission-orange' },
      { id: 'build_art', name: 'Build_Artifacts.', type: 'permission-orange' },
      { id: 'pipeline', name: 'CI/CD Pipeline Manager', type: 'admin-system' },
    ],
    links: [
      { source: 'center', target: 'p1', relation: 'dashed' },
      { source: 'center', target: 'p2', relation: 'dashed' },
      { source: 'center', target: 'p3', relation: 'dashed' },
      { source: 'center', target: 'p4', relation: 'dashed' },
      { source: 'center', target: 'p5', relation: 'solid' },
      { source: 'center', target: 'priv', relation: 'solid' },
      { source: 'center', target: 'pipeline', relation: 'solid-green' },
      { source: 'priv', target: 'git_access', relation: 'dashed-blue' },
      { source: 'priv', target: 'github_ent', relation: 'dashed-blue' },
      { source: 'priv', target: 'ide_auth', relation: 'dashed-blue' },
      { source: 'priv', target: 'repo_read', relation: 'dashed-blue' },
      { source: 'repo_read', target: 'core_lib', relation: 'dashed-orange' },
      { source: 'repo_read', target: 'sec_mod', relation: 'dashed-orange' },
      { source: 'repo_read', target: 'build_art', relation: 'dashed-orange' },
    ],
  });

  ngAfterViewInit() {
    this.renderGraph(false);
  }

  setAccess(userId: string, relationType: 'solid' | 'dashed' | 'none') {
    this.graphData.update((prev) => {
      const updatedLinks = prev.links.filter((l: any) => {
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        return !(sourceId === 'center' && targetId === userId);
      });

      if (relationType !== 'none') {
        updatedLinks.push({
          source: 'center',
          target: userId,
          relation: relationType,
        });
      }
      return { ...prev, links: updatedLinks };
    });

    this.activeMenu.set(null);
    this.renderGraph(true);
  }

  private renderGraph(isUpdate: boolean) {
    const svgElement = this.container.nativeElement;
    const data = this.graphData();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const radius = 30;

    const svg = d3.select(svgElement).attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('g').remove();

    const defs = svg.append('defs');
    defs
      .append('clipPath')
      .attr('id', 'avatar-clip')
      .append('circle')
      .attr('r', radius - 4);

    const createGlow = (id: string, color: string) => {
      const f = defs
        .append('filter')
        .attr('id', id)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      f.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'blur');
      const merge = f.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    };
    createGlow('redGlow', '#ff3e3e');
    createGlow('blueGlow', '#00d4ff');
    createGlow('greenGlow', '#4ade80');

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        'link',
        d3
          .forceLink(data.links)
          .id((d: any) => d.id)
          .distance(220),
      )
      .force('charge', d3.forceManyBody().strength(-1800))
      .force('center', d3.forceCenter(width / 2, height / 2));

    if (isUpdate) {
      data.nodes.forEach((d: any) => {
        d.fx = d.x;
        d.fy = d.y;
      });
      simulation.stop();
      simulation.tick();
      setTimeout(() => {
        data.nodes.forEach((d: any) => {
          d.fx = null;
          d.fy = null;
        });
        simulation.alphaTarget(0).restart();
      }, 50);
    }

    const link = svg
      .append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', (d: any) =>
        d.relation.includes('green')
          ? '#4ade80'
          : d.relation.includes('blue')
            ? '#00d4ff'
            : d.relation.includes('orange')
              ? '#f97316'
              : '#4f5b6e',
      )
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d: any) =>
        d.relation.includes('dashed') ? '5,5' : '0',
      );

    const node = svg
      .append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .on('mouseenter', (event, d: any) => {
        if (d.type === 'user')
          this.activeMenu.set({
            node: d,
            x: d.x + 35, // Positioned to the right of the avatar
            y: d.y + 10, // Slightly lowered
          });
      })
      .call(
        d3
          .drag<any, any>()
          .on('start', (e, d) => {
            if (!e.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (e, d) => {
            d.fx = e.x;
            d.fy = e.y;
          })
          .on('end', (e, d) => {
            if (!e.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any,
      );

    const arcGenerator = d3
      .arc()
      .innerRadius(radius - 1)
      .outerRadius(radius + 1)
      .startAngle(0);

    node.each(function (d: any) {
      const el = d3.select(this);

      if (d.type === 'user') {
        el.append('circle').attr('r', radius).attr('fill', '#0d1117');

        el.append('circle')
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', '#ff3e3e')
          .attr('stroke-width', 1);

        el.append('circle')
          .attr('r', radius + 8)
          .attr('fill', 'none')
          .attr('stroke', '#4f5b6e')
          .attr('stroke-width', 1);

        const accessPercent = d.access || 0;
        const endAngle = (accessPercent / 100) * 2 * Math.PI;
        el.append('path')
          .attr(
            'd',
            arcGenerator({
              endAngle,
              innerRadius: radius - 1,
              outerRadius: radius + 1,
              startAngle: 0,
            } as any),
          )
          .attr('fill', '#4ade80')
          .style('filter', 'url(#greenGlow)');

        el.append('image')
          .attr('xlink:href', d.img || '/images/profile-old.png')
          .attr('x', -(radius - 2))
          .attr('y', -(radius - 2))
          .attr('width', (radius - 2) * 2)
          .attr('height', (radius - 2) * 2)
          .attr('clip-path', 'url(#avatar-clip)');

        // --- NEW PILL STYLE LABEL (MATCHING image_a10bb8.png) ---
        const labelG = el
          .append('g')
          .attr('transform', `translate(0, ${radius + 30})`);

        // Add text first to measure width
        const text = labelG
          .append('text')
          .text(d.name)
          .attr('fill', '#ffffff')
          .style('font-size', '11px')
          .style('font-family', 'sans-serif')
          .attr('x', 10)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle');

        const textWidth = (
          text.node() as SVGTextElement
        ).getComputedTextLength();
        const pillWidth = textWidth + 30;

        // Insert pill background behind text
        labelG
          .insert('rect', 'text')
          .attr('x', -pillWidth / 2)
          .attr('y', -10)
          .attr('width', pillWidth)
          .attr('height', 20)
          .attr('rx', 10)
          .attr('fill', '#161b22')
          .attr('stroke', '#30363d')
          .attr('stroke-width', 1);

        // Add green status dot
        labelG
          .append('circle')
          .attr('cx', -pillWidth / 2 + 10)
          .attr('cy', 0)
          .attr('r', 3)
          .attr('fill', '#4ade80')
          .style('filter', 'url(#greenGlow)');

        // Recenter text inside pill
        text.attr('x', -pillWidth / 2 + 18);
      } else {
        el.append('circle')
          .attr('r', 25)
          .attr('fill', '#0d1117')
          .attr('stroke', d.type === 'ai-core' ? '#ff3e3e' : '#00d4ff')
          .style(
            'filter',
            d.type === 'ai-core' ? 'url(#redGlow)' : 'url(#blueGlow)',
          );

        // Simple text for non-user nodes
        el.append('text')
          .text(d.name)
          .attr('y', 40)
          .attr('text-anchor', 'middle')
          .attr('fill', '#c9d1d9')
          .style('font-size', '11px');
      }
    });

    const updatePositions = () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    };

    simulation.on('tick', updatePositions);
  }
}
